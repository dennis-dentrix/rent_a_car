import { createHash } from 'node:crypto'
import { describe, expect, it, vi } from 'vitest'
import { sendQueuedNotifications } from '../../src/services/notifications.js'
import {
  IDS,
  accounts,
  bookNewQuote,
  call,
  errorOf,
  putFile,
  realPng,
  sampleFile,
  signUpCustomer,
  staff,
  uploadInspectionFiles,
  withApi,
} from './api-client.js'

const db = withApi()

const report = (bookingId, files, overrides = {}) => ({
  booking_id: bookingId,
  type: 'pickup',
  fuel_level: 'full',
  mileage_km: 12000,
  condition_notes: 'Small scratch on the rear bumper.',
  damage_noted: true,
  files,
  ...overrides,
})
const inspect = (body, token = accounts.staff) =>
  call('POST', '/staff/inspections', { body, token })
const newBookingId = async () => (await bookNewQuote()).body.data.id
const threeFiles = (bookingId) =>
  uploadInspectionFiles(bookingId, [
    { label: 'front' },
    { label: 'rear' },
    { kind: 'document', label: 'signed sheet', content_type: 'application/pdf' },
  ])

// A new booking with one uploaded photo: the starting point of most upload checks.
const uploadedFront = async () => {
  const bookingId = await newBookingId()
  const [file] = await uploadInspectionFiles(bookingId, [{ label: 'front' }])
  return { bookingId, file }
}

describe('inspection reports', () => {
  it('saves a report with its uploaded photos and documents against the booking', async () => {
    const bookingId = await newBookingId()
    const { status, body } = await inspect(report(bookingId, await threeFiles(bookingId)))
    const { rows } = await db.query('select vehicle_id from bookings where id = $1', [bookingId])
    expect(status).toBe(201)
    expect(body.data).toMatchObject({
      type: 'pickup',
      damage_noted: true,
      vehicle_id: rows[0].vehicle_id,
    })
    expect(body.data.files).toHaveLength(3)
  })

  it('does not expose where the files are stored', async () => {
    const bookingId = await newBookingId()
    const { body } = await inspect(report(bookingId, await threeFiles(bookingId)))
    expect(JSON.stringify(body.data)).not.toContain('storage_path')
  })

  it('lists the pickup and return reports for a booking', async () => {
    const bookingId = await newBookingId()
    await inspect(report(bookingId, []))
    await inspect(report(bookingId, [], { type: 'return' }))
    const { body } = await staff('GET', `/staff/bookings/${bookingId}/inspections`)
    expect(body.data.map((item) => item.type)).toEqual(['pickup', 'return'])
  })
})

describe('inspection file uploads', () => {
  it("gives links under the booking's own folder", async () => {
    const { bookingId, file } = await uploadedFront()
    expect(file.storage_path.startsWith(`inspections/${bookingId}/`)).toBe(true)
  })

  // Each case spoils the uploaded file in one way; the report must be refused whichever way it is.
  it.each([
    [
      'names a file that was never uploaded',
      (bookingId, file) => ({
        ...file,
        storage_path: `inspections/${bookingId}/never-uploaded.jpg`,
      }),
    ],
    [
      'declares a different size than was uploaded',
      (_bookingId, file) => ({ ...file, size_bytes: file.size_bytes + 1 }),
    ],
  ])('refuses a report that %s', async (_name, spoil) => {
    const { bookingId, file } = await uploadedFront()
    expect((await inspect(report(bookingId, [spoil(bookingId, file)]))).status).toBe(400)
  })

  it("refuses a file from another booking's folder", async () => {
    const [first, second] = [await newBookingId(), await newBookingId()]
    const files = await uploadInspectionFiles(first, [{ label: 'front' }])
    expect((await inspect(report(second, files))).status).toBe(400)
  })

  it('makes the storage refuse a file bigger than the one declared', async () => {
    const bookingId = await newBookingId()
    const { body } = await staff('POST', `/staff/bookings/${bookingId}/inspection-uploads`, {
      files: [{ content_type: 'image/jpeg', size_bytes: 100 }],
    })
    const [link] = body.data
    const bigger = {
      ...link,
      required_headers: { ...link.required_headers, 'Content-Length': '5000' },
    }
    expect(await putFile(bigger, sampleFile('image/jpeg', 5000))).toBe(403)
  })
})

describe('what an inspection file may be', () => {
  it.each([
    ['a photo that is a PDF', { kind: 'photo', content_type: 'application/pdf' }],
    ['a document that is an image', { kind: 'document', content_type: 'image/jpeg' }],
  ])('refuses %s', async (_name, file) => {
    const bookingId = await newBookingId()
    const { status } = await staff('POST', `/staff/bookings/${bookingId}/inspection-uploads`, {
      files: [{ ...file, size_bytes: 2048 }],
    })
    expect(status).toBe(400)
  })
})

describe('opening inspection files', () => {
  const savedFileId = async (bookingId) => {
    const files = await uploadInspectionFiles(bookingId, [{ label: 'front' }])
    const { body } = await inspect(report(bookingId, files))
    return body.data.files[0].id
  }
  const open = (id, token) => call('GET', `/inspection-files/${id}/url`, { token })

  it('gives staff and the customer who rented a link that shows the file', async () => {
    const id = await savedFileId(await newBookingId())
    for (const token of [accounts.staff, accounts.customer]) {
      const { status, body } = await open(id, token)
      const shown = await fetch(body.data.url)
      expect([status, shown.status, (await shown.arrayBuffer()).byteLength]).toEqual([
        200, 200, 2048,
      ])
    }
  })

  it("hides another customer's inspection files", async () => {
    const id = await savedFileId(await newBookingId())
    expect((await open(id, accounts.other)).status).toBe(404)
    expect((await open(IDS.UNKNOWN, accounts.customer)).status).toBe(404)
  })
})

describe('inspection report validation', () => {
  const synthetic = {
    kind: 'photo',
    storage_path: 'inspections/x/y.jpg',
    content_type: 'image/jpeg',
    size_bytes: 10,
  }
  it.each([
    ['a file over 10 MB', { files: [{ ...synthetic, size_bytes: 10485761 }] }],
    ['an unsupported file type', { files: [{ ...synthetic, content_type: 'image/gif' }] }],
    ['an invalid fuel level', { fuel_level: 'overflowing' }],
  ])('rejects %s', async (_name, overrides) => {
    expect((await inspect(report(await newBookingId(), [], overrides))).status).toBe(400)
  })

  it('returns not found for an unknown booking and forbids customers', async () => {
    const unknown = await inspect(report(IDS.UNKNOWN, []))
    const customer = await inspect(report(await newBookingId(), []), accounts.customer)
    expect([unknown.status, customer.status]).toEqual([404, 403])
  })
})

// A rental company with one car, and a renter's booking moved onto that car: what a handover needs.
async function companyHandover(name) {
  const renter = await signUpCustomer('API Company Owner')
  const operator = renter.token
  await call('POST', '/me/operator', { body: { business_name: name }, token: operator })
  const car = await asCompany(operator, 'POST', '/vehicles', {
    registration: `API-${name.slice(-6)}`,
    chassis_number: `API-CHASSIS-${name.slice(-6)}`,
    class_id: IDS.SEDAN,
  })
  const company = await asCompany(operator, 'GET', '/company')
  await call('POST', `/admin/operators/${company.body.data.id}/review`, {
    body: { to: 'approved' },
    token: accounts.admin,
  })
  const bookingId = await newBookingId()
  await staff('POST', `/staff/bookings/${bookingId}/assign`, { vehicle_id: car.body.data.id })
  return { operator, bookingId }
}

const asCompany = (token, method, path, body) => call(method, `/operator${path}`, { body, token })
const asRenter = (method, path, body, token = accounts.customer) =>
  call(method, `/renter${path}`, { body, token })

async function companyPhotos({ operator, bookingId }, count) {
  const files = Array.from({ length: count }, () => ({
    kind: 'photo',
    content_type: 'image/png',
    size_bytes: realPng(64, 48).length,
  }))
  const path = `/bookings/${bookingId}/inspection-uploads`
  const links = (await asCompany(operator, 'POST', path, { files })).body.data
  await Promise.all(links.map((link) => putFile(link, realPng(64, 48))))
  return links.map((link, index) => ({ storage_path: link.storage_path, ...files[index] }))
}

// A recorded pickup report, ready to sign.
async function recorded(name) {
  const setup = await companyHandover(name)
  const files = await companyPhotos(setup, 4)
  const body = report(setup.bookingId, files, { checklist: { tyres: 'ok', lights: 'issue' } })
  const created = await asCompany(setup.operator, 'POST', '/inspections', body)
  const read = await asCompany(setup.operator, 'GET', `/inspections/${created.body.data.id}`)
  return { ...setup, id: created.body.data.id, sha: read.body.data.report_sha256 }
}

const signature = (sha, name = 'Test Signer') => ({
  signed_name: name,
  signature_image: realPng().toString('base64'),
  report_sha256: sha,
})

describe('a company handover is signed and sealed', () => {
  it('needs at least four photos', async () => {
    const setup = await companyHandover('API Inspect Photos')
    const body = report(setup.bookingId, await companyPhotos(setup, 3))
    expect(errorOf(await asCompany(setup.operator, 'POST', '/inspections', body))[0]).toBe(400)
  }, 30_000)

  it('is sealed once both have signed, and the renter can fetch and check the copy', async () => {
    const { operator, id, sha } = await recorded('API Inspect Sealed')
    const first = await asCompany(operator, 'POST', `/inspections/${id}/sign`, signature(sha))
    expect(first.body.data.sealed).toBeNull()
    const again = await asCompany(operator, 'POST', `/inspections/${id}/sign`, signature(sha))
    expect(errorOf(again)).toEqual([409, 'CONFLICT'])
    const both = await asRenter('POST', `/inspections/${id}/sign`, signature(sha, 'Test Renter'))
    expect(both.body.data.signatures.map((entry) => entry.party)).toEqual(['operator', 'renter'])
    const { pdf_sha256: pdfSha } = both.body.data.sealed
    const link = (await asRenter('GET', `/inspections/${id}/report`)).body.data.url
    const pdf = Buffer.from(await (await fetch(link)).arrayBuffer())
    expect(pdf.subarray(0, 5).toString()).toBe('%PDF-')
    expect(createHash('sha256').update(pdf).digest('hex')).toBe(pdfSha)
    const check = await call('GET', `/verify/inspections/${pdfSha}`)
    expect(check.body.data).toMatchObject({ type: 'pickup' })
    expect((await call('GET', `/verify/inspections/${sha}`)).status).toBe(404)
    const { rows } = await db.query(
      "select payload from notifications where kind = 'inspection_report'",
    )
    expect(rows).toHaveLength(1)
    const send = vi.fn().mockResolvedValue(undefined)
    await sendQueuedNotifications({ send })
    const emailed = send.mock.calls.map(([email]) => email).find((email) => email.attachments)
    expect(emailed.attachments).toEqual([
      {
        name: 'inspection-report.pdf',
        mime_type: 'application/pdf',
        content: pdf.toString('base64'),
      },
    ])
    const listed = (await asRenter('GET', '/inspections')).body.data
    expect(listed[0]).toMatchObject({ id, signed_by: expect.arrayContaining(['renter']) })
  }, 40_000)
})

describe('a handover signature is refused', () => {
  it('refuses a signature on a report that is not the one that was read', async () => {
    const { operator, id } = await recorded('API Inspect Changed')
    const stale = signature('0'.repeat(64))
    const refused = await asCompany(operator, 'POST', `/inspections/${id}/sign`, stale)
    expect(errorOf(refused)).toEqual([400, 'VALIDATION_FAILED'])
  }, 30_000)

  it('keeps other people out, and sends no code while email is not set up', async () => {
    const { operator, id, sha } = await recorded('API Inspect Private')
    expect((await asRenter('GET', `/inspections/${id}`, undefined, accounts.other)).status).toBe(
      404,
    )
    const other = await asRenter('POST', `/inspections/${id}/sign`, signature(sha), accounts.other)
    expect(other.status).toBe(404)
    const code = await asCompany(operator, 'POST', `/inspections/${id}/renter-code`)
    expect(errorOf(code)).toEqual([409, 'CONFLICT'])
    const typed = { ...signature(sha), code: '123456' }
    const guess = await asCompany(operator, 'POST', `/inspections/${id}/renter-sign`, typed)
    expect(errorOf(guess)).toEqual([400, 'VALIDATION_FAILED'])
  }, 30_000)
})
