import { crc32, deflateSync } from 'node:zlib'
import { createHmac } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import request from 'supertest'
import { createApp } from '../../src/app.js'
import { assertSafeTarget, withApiTestData } from './helpers.js'

// Shared by the API tests: calls the real Express app against the local Supabase.
export const IDS = {
  SEDAN: '11111111-1111-4111-8111-000000000001',
  ZONE_SUBURBS: '33333333-3333-4333-8333-000000000002',
  CHAUFFEUR: '44444444-4444-4444-8444-000000000001',
  UNKNOWN: '99999999-9999-4999-8999-999999999999',
  // Seeded vehicles and driver (supabase/seed.sql)
  KAA_001: '77777777-7777-4777-8777-000000000001',
  KAA_002: '77777777-7777-4777-8777-000000000002',
  PRADO: '77777777-7777-4777-8777-000000000003',
  DRIVER: '88888888-8888-4888-8888-000000000001',
}

export const DATES = {
  START: '2027-03-01T08:00:00+03:00',
  END_3_DAYS: '2027-03-04T08:00:00+03:00',
  END_7_DAYS: '2027-03-08T08:00:00+03:00',
}

/** A delivery to Westlands, for tests that need a delivery booking. */
export const deliveryHandover = {
  type: 'delivery',
  address: 'Westlands, Nairobi',
  delivery_zone_id: IDS.ZONE_SUBURBS,
  window_start: '2027-03-01T07:00:00+03:00',
  window_end: DATES.START,
}

// Local seed accounts (supabase/seed.sql). Fake credentials for the local stack only.
export const TEST_PASSWORD = 'Passw0rd!local'

let app

/** Load the test environment (.env.test, local stack only, never .env.local) and create the app once. Call from `beforeAll`. */
export function loadApp() {
  process.loadEnvFile('.env.test')
  assertSafeTarget(process.env.SUPABASE_URL)
  app = createApp()
}

export const query = (params) => `?${new URLSearchParams(params)}`

/** Call the API; returns the HTTP status, the parsed JSON body, and the response headers. */
export async function call(method, path, { body, token, headers = {} } = {}) {
  let pending = request(app)[method.toLowerCase()](`/api/v1${path}`)
  if (token) pending = pending.set('authorization', `Bearer ${token}`)
  for (const [name, value] of Object.entries(headers)) pending = pending.set(name, value)
  if (body !== undefined) pending = pending.send(body)
  const response = await pending
  return { status: response.status, body: response.body, headers: response.headers }
}

export const get = (path, options) => call('GET', path, options)

export const postQuote = (body) => call('POST', '/quotes', { body })

const anonClient = () => createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

/** Sign in a seeded account and return its access token. */
export async function signIn(email) {
  const client = anonClient()
  const { data, error } = await client.auth.signInWithPassword({ email, password: TEST_PASSWORD })
  if (error) throw error
  return data.session.access_token
}

export const officeQuote = (overrides = {}) => ({
  class_id: IDS.SEDAN,
  start_at: DATES.START,
  end_at: DATES.END_3_DAYS,
  handover: { type: 'office' },
  ...overrides,
})

// Access tokens for the seeded accounts, filled by loadAccounts().
export const accounts = {}

export async function loadAccounts() {
  accounts.customer = await signIn('customer@example.test')
  accounts.other = await signIn('customer2@example.test')
  accounts.staff = await signIn('staff@example.test')
  accounts.admin = await signIn('admin@example.test')
}

export const CUSTOMER = {
  full_name: 'Test Customer',
  phone: '+254700000001',
  email: 'customer@example.test',
}
export const OTHER_CUSTOMER = {
  full_name: 'Test Two',
  phone: '+254700000002',
  email: 'customer2@example.test',
}

export const createBooking = (body, token = accounts.customer) =>
  call('POST', '/bookings', { body, token })

/** Quote the sedan for the standard dates, then book that quote. */
export async function bookNewQuote(customer = CUSTOMER, token = accounts.customer, quoteOverrides) {
  const quote = await postQuote(officeQuote(quoteOverrides))
  return createBooking({ quote_id: quote.body.data.id, customer }, token)
}

/** Create the app and sign in the seeded accounts, then manage test data. Returns the database client. */
export const withApi = () =>
  withApiTestData(async () => {
    loadApp()
    await loadAccounts()
  })

let signUpCount = 0

/** The service-role client, for set-up steps no customer can do for themselves (confirming an email). Local stack only. */
const serviceClient = () =>
  createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  })

/**
 * Sign up a new customer the way the website does. The local project asks for email confirmation, as production does,
 * so the test confirms the address itself and then signs in. Returns the account's id, email, and token.
 */
export async function signUpCustomer(fullName = 'New Customer') {
  signUpCount += 1
  const email = `signup-${Date.now()}-${signUpCount}@example.test`
  const options = { data: { full_name: fullName } }
  const { data, error } = await anonClient().auth.signUp({
    email,
    password: TEST_PASSWORD,
    options,
  })
  if (error) throw error
  await serviceClient().auth.admin.updateUserById(data.user.id, { email_confirm: true })
  return { id: data.user.id, email, token: await signIn(email) }
}

const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

function base32Decode(input) {
  const bits = [...input.toUpperCase().replace(/=+$/, '')]
    .map((char) => BASE32.indexOf(char).toString(2).padStart(5, '0'))
    .join('')
  const bytes = bits.match(/.{8}/g).map((byte) => parseInt(byte, 2))
  return Buffer.from(bytes)
}

/** The 6-digit code an authenticator app would show now (RFC 6238, 30-second steps). */
export function totpCode(secret, now = Date.now()) {
  const counter = Buffer.alloc(8)
  counter.writeBigUInt64BE(BigInt(Math.floor(now / 30000)))
  const hmac = createHmac('sha1', base32Decode(secret)).update(counter).digest()
  const offset = hmac[hmac.length - 1] & 0xf
  return String((hmac.readUInt32BE(offset) & 0x7fffffff) % 1_000_000).padStart(6, '0')
}

/** Sign in, enrol an authenticator app, and verify it. Returns a token for a second-factor session. */
export async function signInWithSecondFactor(email) {
  const client = anonClient()
  await client.auth.signInWithPassword({ email, password: TEST_PASSWORD })
  const { data: factor } = await client.auth.mfa.enroll({ factorType: 'totp' })
  const { data: challenge } = await client.auth.mfa.challenge({ factorId: factor.id })
  const code = totpCode(factor.totp.secret)
  await client.auth.mfa.verify({ factorId: factor.id, challengeId: challenge.id, code })
  return (await client.auth.getSession()).data.session.access_token
}

// Helpers for tests that act as staff and book for walk-in customers.
let walkInCount = 0
/** A walk-in customer who has no account yet. Email and phone are unique per call. */
export const walkIn = () => {
  walkInCount += 1
  return {
    full_name: 'Walk In',
    phone: `+25472000${String(walkInCount).padStart(4, '0')}`,
    email: `walkin-${Date.now()}-${walkInCount}@example.test`,
  }
}

export const staff = (method, path, body) => call(method, path, { body, token: accounts.staff })
export const staffBooking = (overrides = {}) =>
  staff('POST', '/staff/bookings', { quote: officeQuote(), customer: walkIn(), ...overrides })
export const newBooking = async (overrides) => (await staffBooking(overrides)).body.data
export const changeStatus = (id, to_status, note) =>
  staff('PATCH', `/staff/bookings/${id}/status`, { to_status, note })

// Uploading files through the signed links, as the browser does.

const SIGNATURES = {
  'image/jpeg': Buffer.from([0xff, 0xd8, 0xff, 0xe0]),
  'image/png': Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  'application/pdf': Buffer.from('%PDF-1.7\n'),
}

/** Bytes that start like a real file of that type. `fill` makes two files of one size differ. */
export const sampleFile = (contentType = 'application/pdf', size = 2048, fill = 'a') =>
  Buffer.concat([
    SIGNATURES[contentType],
    Buffer.alloc(size - SIGNATURES[contentType].length, fill),
  ])

const pngChunk = (type, data) => {
  const body = Buffer.concat([Buffer.from(type), data])
  const frame = Buffer.alloc(8)
  frame.writeUInt32BE(data.length, 0)
  frame.writeUInt32BE(crc32(body), 4)
  return Buffer.concat([frame.subarray(0, 4), body, frame.subarray(4)])
}

/** A real, readable PNG of the given size, for places where the picture itself is opened (a signature). */
export function realPng(width = 120, height = 40) {
  const header = Buffer.alloc(13)
  header.writeUInt32BE(width, 0)
  header.writeUInt32BE(height, 4)
  header.set([8, 0, 0, 0, 0], 8)
  // One filter byte, then one grey byte per pixel; the pattern keeps it from compressing to almost nothing.
  const rows = Buffer.from(
    Array.from({ length: height * (width + 1) }, (_, i) => (i % (width + 1) ? (i * 7) % 251 : 0)),
  )
  return Buffer.concat([
    SIGNATURES['image/png'],
    pngChunk('IHDR', header),
    pngChunk('IDAT', deflateSync(rows)),
    pngChunk('IEND', Buffer.alloc(0)),
  ])
}

/** Send bytes to a signed upload link. Returns the storage's HTTP status (200 when accepted). */
export async function putFile(link, bytes) {
  const response = await fetch(link.upload_url, {
    method: 'PUT',
    headers: link.required_headers,
    body: bytes,
  })
  return response.status
}

/**
 * Start a document upload, send the file, and confirm it, as a customer (default) or as staff.
 * Pass `path` for the staff route `/staff/bookings/{id}/documents`. Returns the document id and the
 * result of the confirming call.
 */
export async function uploadDocument(token, { path = '/documents', size = 2048, ...input } = {}) {
  const declared = {
    type: 'national_id',
    content_type: 'application/pdf',
    size_bytes: size,
    ...input,
  }
  const created = await call('POST', path, { body: declared, token })
  await putFile(created.body.data, sampleFile(declared.content_type, size))
  const completed = await call('POST', `/documents/${created.body.data.id}/complete`, { token })
  return { id: created.body.data.id, completed }
}

/**
 * Ask for upload links for a booking's inspection files and send a file to each. Returns the file
 * entries to put in the report. Each spec can set kind, label, content_type, and size_bytes.
 */
export async function uploadInspectionFiles(bookingId, specs) {
  const files = specs.map(({ kind = 'photo', content_type = 'image/jpeg', size_bytes = 2048 }) => ({
    kind,
    content_type,
    size_bytes,
  }))
  const { body } = await staff('POST', `/staff/bookings/${bookingId}/inspection-uploads`, { files })
  await Promise.all(
    body.data.map((link, index) =>
      putFile(link, sampleFile(files[index].content_type, files[index].size_bytes)),
    ),
  )
  return body.data.map((link, index) => ({
    label: specs[index].label,
    storage_path: link.storage_path,
    ...files[index],
  }))
}

/** Call the API as a customer (the first test customer unless another token is given). */
export const asCustomer = (method, path, body, token = accounts.customer) =>
  call(method, path, { body, token })

/** Call a route that answers with a file (a PDF). Returns the status, content type, and the bytes. */
export async function getBinary(path, token) {
  const response = await request(app)
    .get(`/api/v1${path}`)
    .set('authorization', `Bearer ${token}`)
    .buffer(true)
    .parse((res, done) => {
      const chunks = []
      res.on('data', (chunk) => chunks.push(chunk))
      res.on('end', () => done(null, Buffer.concat(chunks)))
    })
  return { status: response.status, type: response.headers['content-type'], bytes: response.body }
}

/** Review an uploaded document as staff: accept it, or reject it with a reason. */
export const reviewDocument = (id, review) => staff('PATCH', `/staff/documents/${id}`, review)

/** The status and error code of a response, for asserting a refused request in one line. */
export const errorOf = ({ status, body }) => [status, body.error?.code]
