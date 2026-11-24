import pg from 'pg'
import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest'

// Database tests run against the local Supabase Postgres, each inside a transaction that is rolled back.
const connectionString =
  process.env.TEST_DATABASE_URL ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'

export const ids = {
  custA: '00000000-0000-4000-8000-0000000000a1',
  custB: '00000000-0000-4000-8000-0000000000b1',
  approver: '00000000-0000-4000-8000-0000000000c1',
  staff: '00000000-0000-4000-8000-0000000000d1',
  admin: '00000000-0000-4000-8000-0000000000e1',
  company: '00000000-0000-4000-8000-0000000000f1',
  cls: '00000000-0000-4000-8000-000000000101',
  veh1: '00000000-0000-4000-8000-000000000201',
  veh2: '00000000-0000-4000-8000-000000000202',
  bookingA: '00000000-0000-4000-8000-000000000301',
  bookingB: '00000000-0000-4000-8000-000000000302',
  docA: '00000000-0000-4000-8000-000000000401',
  paymentA: '00000000-0000-4000-8000-000000000501',
  ghost: '00000000-0000-4000-8000-0000000000aa',
}

const isLocal = (url) => /^(https?|postgres(ql)?):\/\/[^/]*(127\.0\.0\.1|localhost)/.test(url ?? '')

/**
 * These tests empty tables and create fake accounts, so they only run against the local stack. Set
 * ALLOW_REMOTE_TESTS=true to run them against a throwaway staging project. Never point them at production.
 */
export function assertSafeTarget(url) {
  if (process.env.ALLOW_REMOTE_TESTS === 'true' || isLocal(url)) return
  throw new Error(
    `Refusing to run tests that wipe data against ${new URL(url).host}. Use the local Supabase, or set ALLOW_REMOTE_TESTS=true for a throwaway staging project.`,
  )
}

export async function connect() {
  assertSafeTarget(connectionString)
  const client = new pg.Client({ connectionString })
  await client.connect()
  return client
}

/** Run a query; on error roll back to a savepoint so the transaction stays usable. */
export async function attempt(client, sql, params = []) {
  await client.query('savepoint attempt')
  try {
    const result = await client.query(sql, params)
    await client.query('release savepoint attempt')
    return { rows: result.rows, rowCount: result.rowCount, error: null }
  } catch (error) {
    await client.query('rollback to savepoint attempt')
    return { rows: [], rowCount: 0, error }
  }
}

/** Act as a signed-in user (RLS applies), or as `anon` with no user id. */
export async function actAs(client, userId) {
  await client.query('reset role')
  if (!userId) {
    await client.query('set local role anon')
    return
  }
  await client.query('set local role authenticated')
  const claims = JSON.stringify({ sub: userId, role: 'authenticated' })
  await client.query("select set_config('request.jwt.claims', $1, true)", [claims])
}

export const actAsOwner = (client) => client.query('reset role')

const users = [
  [ids.custA, 'Customer A', 'customer', null],
  [ids.custB, 'Customer B', 'customer', ids.company],
  [ids.approver, 'Approver', 'corporate_approver', ids.company],
  [ids.staff, 'Staff', 'staff', null],
  [ids.admin, 'Admin', 'admin', null],
]

/** Seed the baseline rows every test starts from: people, fleet, two bookings, a payment and a document. */
export async function seed(client) {
  await seedPeople(client)
  await seedFleet(client)
  await seedBookingsAndRecords(client)
}

async function seedPeople(client) {
  await client.query("insert into companies (id, name) values ($1, 'Company A')", [ids.company])
  for (const [id, name, role, company] of users) {
    await client.query('insert into auth.users (id, email) values ($1, $2)', [
      id,
      `${id}@example.invalid`,
    ])
    await client.query(
      'insert into profiles (id, full_name, role, company_id) values ($1, $2, $3, $4) on conflict (id) do update set full_name = excluded.full_name, role = excluded.role, company_id = excluded.company_id',
      [id, name, role, company],
    )
  }
}

async function seedFleet(client) {
  await client.query(
    "insert into vehicle_classes (id, name, slug, seats) values ($1, 'Executive', 'executive', 4)",
    [ids.cls],
  )
  await client.query(
    "insert into vehicles (id, registration, chassis_number, class_id) values ($1, 'TEST 001A', 'FIXTURECHASSIS001', $3), ($2, 'TEST 002A', 'FIXTURECHASSIS002', $3)",
    [ids.veh1, ids.veh2, ids.cls],
  )
}

async function seedBookingsAndRecords(client) {
  await insertBooking(client, {
    id: ids.bookingA,
    reference: 'A1',
    customer: ids.custA,
    vehicle: ids.veh1,
    start: '2026-12-01',
    end: '2026-12-04',
  })
  await insertBooking(client, {
    id: ids.bookingB,
    reference: 'B1',
    customer: ids.custB,
    company: ids.company,
    vehicle: ids.veh2,
    start: '2026-12-01',
    end: '2026-12-04',
  })
  await client.query(
    "insert into payments (id, booking_id, kind, method, amount_kes, status) values ($1, $2, 'deposit', 'mpesa', 1000, 'succeeded')",
    [ids.paymentA, ids.bookingA],
  )
  await insertDocument(client, { id: ids.docA })
}

/** True when a statement was stopped, either by an error or by RLS filtering every row. */
export const isBlocked = (result) => Boolean(result.error) || result.rowCount === 0

/** SQL and params for a booking row. Pass to `attempt(client, ...bookingInsert(b))` or `insertBooking`. */
export function bookingInsert({
  id = null,
  reference,
  customer,
  company = null,
  vehicle,
  start,
  end,
  status = 'confirmed',
}) {
  return [
    `insert into bookings (id, reference, customer_id, company_id, vehicle_id, class_id, start_at, end_at,
       status, handover_type, total_kes, deposit_kes, balance_kes, pricing_snapshot)
     values (coalesce($1, gen_random_uuid()), $2, $3, $4, $5, $6, $7, $8, $9, 'office', 10000, 3000, 7000, '{}')`,
    [id, reference, customer, company, vehicle, ids.cls, start, end, status],
  ]
}

export const insertBooking = (client, booking) => client.query(...bookingInsert(booking))

/** Move a booking through the `transition_booking` function. */
export const transition = (client, bookingId, toStatus, actor, note = null) =>
  client.query('select transition_booking($1, $2, $3, $4)', [bookingId, toStatus, actor, note])

/** Request a refund of `ids.paymentA` as `requestedBy`; returns the `attempt` result with the new id. */
export const requestRefund = (client, requestedBy) =>
  attempt(
    client,
    "insert into refunds (payment_id, amount_kes, reason, requested_by) values ($1, 500, 'test', $2) returning id",
    [ids.paymentA, requestedBy],
  )

export const approveRefund = (client, refundId, approvedBy) =>
  attempt(client, "update refunds set status = 'approved', approved_by = $2 where id = $1", [
    refundId,
    approvedBy,
  ])

/** Insert a private vehicle owner and return its id. */
export const insertOwner = async (client, name = 'Owner One', phone = '+254711000011') =>
  (
    await client.query(
      'insert into vehicle_owners (full_name, phone) values ($1, $2) returning id',
      [name, phone],
    )
  ).rows[0].id

/** An agreement between an owner and a vehicle; returns the `attempt` result. */
export const insertAgreement = (client, ownerId, vehicleId, start = '2026-01-01', end = null) =>
  attempt(
    client,
    'insert into ownership_agreements (owner_id, vehicle_id, commission_percent, starts_on, ends_on) values ($1, $2, 20, $3, $4)',
    [ownerId, vehicleId, start, end],
  )

/** A tracker on a vehicle; returns the `attempt` result. */
export const insertTracker = (client, vehicleId, deviceId, status = 'active') =>
  attempt(
    client,
    "insert into vehicle_trackers (vehicle_id, provider, device_id, status) values ($1, 'Test Telematics', $2, $3)",
    [vehicleId, deviceId, status],
  )

/** An inspection report for a booking; returns the `attempt` result with the new id. */
export const insertInspection = (
  client,
  { booking = ids.bookingA, vehicle = ids.veh1, type = 'pickup' } = {},
) =>
  attempt(
    client,
    `insert into handover_records (booking_id, type, vehicle_id, fuel_level, mileage_km, recorded_by, recorded_at)
     values ($1, $2, $3, 'full', 1000, $4, now()) returning id`,
    [booking, type, vehicle, ids.staff],
  )

/** A photo or document attached to an inspection; returns the `attempt` result. */
export const insertInspectionFile = (
  client,
  recordId,
  { path = 'inspections/a.jpg', size = 2048 } = {},
) =>
  attempt(
    client,
    "insert into inspection_files (handover_record_id, kind, label, storage_path, content_type, size_bytes) values ($1, 'photo', 'front', $2, 'image/jpeg', $3)",
    [recordId, path, size],
  )

/** An owner with private details (national ID, payout account); returns the owner id. */
export async function insertOwnerWithPrivateDetails(client) {
  const owner = await insertOwner(client)
  await client.query(
    "insert into vehicle_owner_private (owner_id, national_id_number, payout_account) values ($1, '12345678', '+254711000011')",
    [owner],
  )
  return owner
}

/**
 * Clear what API tests leave behind. They run through the API on separate connections, so their
 * rows cannot be rolled back. Seed data is untouched; test-made fleet rows are recognised by prefix.
 */
export async function resetTestData(client) {
  await client.query(
    'truncate bookings, booking_status_events, quotes, notifications, enquiries cascade',
  )
  await deleteApiAdminData(client)
  await client.query("delete from vehicle_trackers where device_id like 'API-%'")
  await client.query(
    "delete from ownership_agreements where vehicle_id in (select id from vehicles where registration like 'API-%')",
  )
  await client.query("delete from vehicles where registration like 'API-%'")
  await client.query(
    "delete from vehicle_owner_private where owner_id in (select id from vehicle_owners where full_name like 'API %')",
  )
  await client.query("delete from vehicle_owners where full_name like 'API %'")
  // Accounts that edited their profile are named in the audit log, which is append-only; TRUNCATE is the
  // one way to clear it. Profiles are only soft-deleted in production, so this is test cleanup only.
  await client.query('truncate audit_log')
  await client.query(
    "delete from auth.users where email like 'walkin-%' or email like 'signup-%' or email like 'invite-%' or email like 'trigger-%'",
  )
  // Companies started through the API come after the accounts that belong to them.
  await client.query("delete from operators where business_name like 'API %'")
  await client.query('delete from auth.mfa_factors')
}

// Business data the admin tests enter is named with an "API " prefix (slugs "api-"), so it can be removed.
async function deleteApiAdminData(client) {
  const apiClasses = "select id from vehicle_classes where name like 'API %'"
  await client.query(`delete from rates where class_id in (${apiClasses})`)
  await client.query(`delete from vehicles where class_id in (${apiClasses})`)
  await client.query("delete from vehicle_classes where name like 'API %'")
  await client.query("delete from discounts where label like 'API %'")
  await client.query("delete from extras where name like 'API %'")
  await client.query("delete from delivery_zones where name like 'API %'")
  await client.query("delete from locations where slug like 'api-%'")
  await client.query("delete from posts where slug like 'api-%'")
}

/**
 * A database client for use inside tests that is connected by a `beforeAll` hook. The proxy forwards
 * every call to the client once it exists, so tests can use it like a plain `const client`.
 */
const liveClient = (state) =>
  new Proxy(
    {},
    {
      get: (_target, property) => {
        const value = state.client[property]
        return typeof value === 'function' ? value.bind(state.client) : value
      },
    },
  )

/**
 * Register the hooks for a test file that works inside a transaction: connect once, then for each
 * test begin, load the baseline seed, and roll back afterwards. Returns the client.
 */
export function withSeededTransaction() {
  const state = {}
  beforeAll(async () => {
    state.client = await connect()
  })
  afterAll(() => state.client.end())
  beforeEach(async () => {
    await state.client.query('begin')
    await seed(state.client)
  })
  afterEach(() => state.client.query('rollback'))
  return liveClient(state)
}

/**
 * Register the hooks for a test file that goes through the API: connect to the database for set-up
 * and checks, and clear test-made rows before each test and at the end. Returns the client.
 */
export function withApiTestData(setup) {
  const state = {}
  beforeAll(async () => {
    await setup()
    state.client = await connect()
  })
  afterAll(async () => {
    await resetTestData(state.client)
    await state.client.end()
  })
  beforeEach(() => resetTestData(state.client))
  return liveClient(state)
}

const DOCUMENT_TYPES = ['national_id', 'driving_licence', 'agreement']

/** Verified ID, driving licence, and agreement for a booking, so it can become ready. */
export async function insertVerifiedDocuments(
  client,
  { booking = ids.bookingA, owner = ids.custA } = {},
) {
  for (const type of DOCUMENT_TYPES) {
    await insertDocument(client, { owner, booking, type, status: 'verified' })
  }
}

/** Run `transition_booking` as the database owner; returns the `attempt` result. */
export const tryTransition = (client, booking, toStatus) =>
  attempt(client, 'select transition_booking($1, $2, $3, null)', [booking, toStatus, ids.staff])

/** A document whose file has arrived in storage. Defaults to an ID of the first test customer. */
export function insertDocument(
  client,
  { id = null, owner = ids.custA, booking = null, type = 'national_id', status = 'uploaded' } = {},
) {
  return client.query(
    `insert into documents (id, owner_id, booking_id, type, storage_path, content_type, size_bytes,
       file_confirmed_at, status)
     values (coalesce($1, gen_random_uuid()), $2, $3, $4, $5, 'application/pdf', 1024, now(), $6)`,
    [id, owner, booking, type, `fixtures/${owner}/${booking ?? 'none'}/${type}/${status}`, status],
  )
}
