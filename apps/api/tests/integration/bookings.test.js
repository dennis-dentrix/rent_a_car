import { describe, expect, it } from 'vitest'
import {
  CUSTOMER,
  DATES,
  IDS,
  OTHER_CUSTOMER,
  accounts,
  bookNewQuote,
  call,
  createBooking,
  errorOf,
  get,
  officeQuote,
  postQuote,
  query,
  withApi,
} from './api-client.js'

// Bookings are made through the API on separate connections, so they cannot be rolled back.
const db = withApi()

const listBookings = (params = {}, token = accounts.customer) =>
  get(`/bookings${query(params)}`, { token })

const sedansFree = async () => {
  const params = { class_id: IDS.SEDAN, start_at: DATES.START, end_at: DATES.END_3_DAYS }
  return (await get(`/availability${query(params)}`)).body.data.available_count
}

describe('POST /bookings', () => {
  it('requires a signed-in customer', async () => {
    const { status, body } = await createBooking({}, null)
    expect(status).toBe(401)
    expect(body.error.code).toBe('UNAUTHENTICATED')
  })

  it('creates a pending booking that holds a vehicle', async () => {
    const { status, body } = await bookNewQuote()
    expect(status).toBe(201)
    expect(body.data).toMatchObject({
      status: 'pending_payment',
      total_kes: 37500,
      payment_url: null,
    })
    expect(body.data.reference).toMatch(/^BK-[0-9A-F]{8}$/)
    expect(new Date(body.data.hold_expires_at) > new Date()).toBe(true)
    expect(await sedansFree()).toBe(1)
  })

  it('returns only the booking summary, not internal fields', async () => {
    const { body } = await bookNewQuote()
    expect(body.data).not.toHaveProperty('vehicle_id')
    expect(body.data).not.toHaveProperty('customer_id')
    expect(body.data).not.toHaveProperty('pricing_snapshot')
  })
})

describe('POST /bookings conflicts', () => {
  it('refuses a second booking from the same quote', async () => {
    const quote = await postQuote(officeQuote())
    const request = { quote_id: quote.body.data.id, customer: CUSTOMER }
    await createBooking(request)
    const { status, body } = await createBooking(request)
    expect([status, body.error.code]).toEqual([409, 'CONFLICT'])
  })

  it('refuses an expired quote', async () => {
    const quote = await postQuote(officeQuote())
    await db.query("update quotes set expires_at = now() - interval '1 minute' where id = $1", [
      quote.body.data.id,
    ])
    const { status, body } = await createBooking({
      quote_id: quote.body.data.id,
      customer: CUSTOMER,
    })
    expect([status, body.error.code]).toEqual([422, 'QUOTE_EXPIRED'])
  })

  it('refuses a booking when every vehicle of the class is taken', async () => {
    await bookNewQuote()
    await bookNewQuote(OTHER_CUSTOMER, accounts.other)
    expect(errorOf(await bookNewQuote())).toEqual([409, 'BOOKING_OVERLAP'])
  })
})

describe('POST /bookings validation', () => {
  it('returns not found for an unknown quote', async () => {
    const { status } = await createBooking({ quote_id: IDS.UNKNOWN, customer: CUSTOMER })
    expect(status).toBe(404)
  })

  it('rejects a phone number that is not in international format', async () => {
    const { status, body } = await createBooking({
      quote_id: IDS.UNKNOWN,
      customer: { ...CUSTOMER, phone: '0700000001' },
    })
    expect([status, body.error.code]).toEqual([400, 'VALIDATION_FAILED'])
  })

  it('rejects a phone number that belongs to another account', async () => {
    const { status } = await bookNewQuote({ ...CUSTOMER, phone: OTHER_CUSTOMER.phone })
    expect(status).toBe(400)
  })

  it('refuses billing to a company the customer does not belong to', async () => {
    const customer = { ...CUSTOMER, company_id: IDS.UNKNOWN }
    const { status } = await bookNewQuote(customer)
    expect(status).toBe(403)
  })
})

describe('GET /bookings', () => {
  it('lists only the caller own bookings', async () => {
    await bookNewQuote()
    await bookNewQuote(OTHER_CUSTOMER, accounts.other)
    const { body } = await listBookings()
    expect(body.data).toHaveLength(1)
    expect(body.data[0]).toHaveProperty('reference')
  })

  it('filters by status', async () => {
    await bookNewQuote()
    expect((await listBookings({ status: 'confirmed' })).body.data).toHaveLength(0)
    expect((await listBookings({ status: 'pending_payment' })).body.data).toHaveLength(1)
  })

  it('pages with an opaque cursor', async () => {
    await bookNewQuote()
    await bookNewQuote()
    const first = (await listBookings({ limit: 1 })).body
    const second = (await listBookings({ limit: 1, cursor: first.meta.next_cursor })).body
    expect(first.meta.next_cursor).not.toBeNull()
    expect(second.meta.next_cursor).toBeNull()
    expect(second.data[0].id).not.toBe(first.data[0].id)
  })

  it('rejects a cursor that is not valid', async () => {
    const { status } = await listBookings({ cursor: 'not-a-cursor' })
    expect(status).toBe(400)
  })
})

describe('GET /bookings/{id}', () => {
  const getOne = (id, token = accounts.customer) => get(`/bookings/${id}`, { token })

  it('returns the booking with its timeline', async () => {
    const created = (await bookNewQuote()).body.data
    const { status, body } = await getOne(created.id)
    const steps = body.data.timeline.map((step) => `${step.label}:${step.state}`)
    expect(status).toBe(200)
    expect(steps.slice(0, 2)).toEqual(['Quote:done', 'Deposit paid:current'])
    expect(body.data).toMatchObject({ documents: [], payments: [], handover: { type: 'office' } })
  })

  it("hides another customer's booking", async () => {
    const created = (await bookNewQuote()).body.data
    expect((await getOne(created.id, accounts.other)).status).toBe(404)
  })

  it('returns not found for an id that is not a uuid', async () => {
    expect((await getOne('abc')).status).toBe(404)
  })
})

describe('POST /internal/jobs/expire-holds', () => {
  const runJob = (secret) =>
    call('POST', '/internal/jobs/expire-holds', {
      headers: secret ? { 'x-job-secret': secret } : {},
    })

  it('rejects a call without the job secret', async () => {
    expect((await runJob(null)).status).toBe(401)
    expect((await runJob('wrong')).status).toBe(401)
  })

  it('expires an unpaid booking after its hold and frees the vehicle', async () => {
    const created = (await bookNewQuote()).body.data
    await db.query(
      "update bookings set hold_expires_at = now() - interval '1 minute' where id = $1",
      [created.id],
    )
    const { body } = await runJob(process.env.INTERNAL_JOB_SECRET)
    expect(body.data.expired).toBe(1)
    expect((await listBookings({ status: 'expired' })).body.data).toHaveLength(1)
    expect(await sedansFree()).toBe(2)
  })
})
