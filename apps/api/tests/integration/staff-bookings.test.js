import { describe, expect, it } from 'vitest'
import {
  IDS,
  accounts,
  call,
  changeStatus,
  deliveryHandover,
  errorOf,
  get,
  newBooking,
  officeQuote,
  query,
  staff,
  staffBooking,
  walkIn,
  withApi,
} from './api-client.js'
import { insertVerifiedDocuments } from './helpers.js'

const db = withApi()

describe('enquiries', () => {
  const enquiry = {
    name: 'Amina',
    email: 'amina@example.test',
    phone: '+254700000100',
    message: 'Do you have an SUV for Friday?',
  }

  it('lets a guest send an enquiry and returns only its id', async () => {
    const { status, body } = await call('POST', '/enquiries', { body: enquiry })
    const { rows } = await db.query('select source from enquiries where id = $1', [body.data.id])
    expect([status, Object.keys(body.data), rows[0].source]).toEqual([201, ['id'], 'form'])
  })

  it.each([
    ['a phone number not in international format', { ...enquiry, phone: '0700000100' }],
    ['no email address', { name: 'Amina', phone: '+254700000100' }],
    ['only one date', { ...enquiry, start_at: '2027-03-01T08:00:00+03:00' }],
    ['a source chosen by the visitor', { ...enquiry, source: 'phone' }],
  ])('rejects %s', async (_name, body) => {
    expect((await call('POST', '/enquiries', { body })).status).toBe(400)
  })
})

describe('enquiry phone numbers', () => {
  const enquiry = { name: 'Amina', email: 'amina@example.test' }

  it('takes a phone number from any country, or none at all', async () => {
    for (const phone of ['+44 20 7946 0958', '0015415550132', '+1 (415) 555-0132', undefined]) {
      const body = { ...enquiry, phone }
      expect((await call('POST', '/enquiries', { body })).status).toBe(201)
    }
    const { rows } = await db.query('select phone from enquiries order by created_at')
    expect(rows.map((row) => row.phone)).toEqual([
      '+442079460958',
      '+15415550132',
      '+14155550132',
      null,
    ])
  })

  it('lets staff log a WhatsApp enquiry and list the open ones', async () => {
    const created = await staff('POST', '/staff/enquiries', { ...enquiry, source: 'whatsapp' })
    const open = await staff('GET', '/staff/enquiries?status=open')
    expect([created.status, open.body.data[0].source]).toEqual([201, 'whatsapp'])
  })

  it('keeps enquiries away from customers', async () => {
    const { status } = await call('GET', '/staff/enquiries', { token: accounts.customer })
    expect(status).toBe(403)
  })
})

describe('staff creates a booking', () => {
  it('books a walk-in customer, creating their account, with no hold expiry', async () => {
    const customer = walkIn()
    const { status, body } = await staffBooking({ customer })
    const { rows } = await db.query('select full_name from profiles where email = $1', [
      customer.email,
    ])
    expect([status, body.data.status, body.data.hold_expires_at]).toEqual([
      201,
      'pending_payment',
      null,
    ])
    expect(rows).toHaveLength(1)
  })

  it('reuses the customer when the email already has an account', async () => {
    const customer = walkIn()
    await staffBooking({ customer })
    await staffBooking({ customer })
    const { rows } = await db.query('select id from profiles where email = $1', [customer.email])
    expect(rows).toHaveLength(1)
  })

  it('books the vehicle staff choose', async () => {
    const { id } = await newBooking({ vehicle_id: IDS.KAA_002 })
    const { body } = await staff('GET', `/staff/bookings/${id}`)
    expect(body.data.vehicle.registration).toBe('KAA 002A')
  })

  it('creates the delivery record for a delivery booking', async () => {
    const { id } = await newBooking({ quote: officeQuote({ handover: deliveryHandover }) })
    const { rows } = await db.query('select address from deliveries where booking_id = $1', [id])
    expect(rows[0].address).toBe('Westlands, Nairobi')
  })
})

describe('staff booking validation', () => {
  it('refuses a vehicle of the wrong class', async () => {
    expect((await staffBooking({ vehicle_id: IDS.PRADO })).status).toBe(400)
  })

  it('needs exactly one of quote_id and quote', async () => {
    const neither = await staff('POST', '/staff/bookings', { customer: walkIn() })
    const both = await staffBooking({ quote_id: IDS.UNKNOWN })
    expect([neither.status, both.status]).toEqual([400, 400])
  })

  it('keeps the route away from customers', async () => {
    const body = { quote: officeQuote(), customer: walkIn() }
    const { status } = await call('POST', '/staff/bookings', { body, token: accounts.customer })
    expect(status).toBe(403)
  })

  it('marks an enquiry converted and refuses to convert it twice', async () => {
    const enquiry = await call('POST', '/enquiries', {
      body: { name: 'Amina', email: 'amina2@example.test' },
    })
    const body = { enquiry_id: enquiry.body.data.id }
    expect((await staffBooking(body)).status).toBe(201)
    expect((await staff('GET', '/staff/enquiries?status=converted')).body.data).toHaveLength(1)
    expect((await staffBooking(body)).status).toBe(409)
  })
})

describe('the staff inbox', () => {
  it('filters by status, handover type, and start date', async () => {
    await newBooking()
    await newBooking({ quote: officeQuote({ handover: deliveryHandover }) })
    const list = async (params) => (await staff('GET', `/staff/bookings${query(params)}`)).body.data
    expect(await list({ status: 'confirmed' })).toHaveLength(0)
    expect(await list({ handover_type: 'delivery' })).toHaveLength(1)
    expect(await list({ date: '2027-03-01' })).toHaveLength(2)
    expect(await list({ date: '2027-03-02' })).toHaveLength(0)
  })

  it('shows the customer and vehicle on each booking and pages with a cursor', async () => {
    await newBooking()
    await newBooking()
    const first = (await staff('GET', '/staff/bookings?limit=1')).body
    expect(first.data[0].customer.full_name).toBe('Walk In')
    expect(first.meta.next_cursor).not.toBeNull()
  })

  it('shows one booking with its status history and who made each change', async () => {
    const { id } = await newBooking()
    await changeStatus(id, 'confirmed', 'Deposit received by M-PESA')
    const { body } = await staff('GET', `/staff/bookings/${id}`)
    expect(body.data.events.map((event) => event.to_status)).toEqual([
      'pending_payment',
      'confirmed',
    ])
    expect(body.data.events[1]).toMatchObject({
      note: 'Deposit received by M-PESA',
      actor: { full_name: 'Test Staff' },
    })
    expect(body.data.next_statuses).toEqual(['ready', 'cancelled'])
  })
})

describe('changing status', () => {
  it('refuses a move the transition table does not allow', async () => {
    const { id } = await newBooking()
    const { status, body } = await changeStatus(id, 'active')
    expect([status, body.error.code]).toEqual([422, 'INVALID_STATUS_TRANSITION'])
  })

  it('keeps the route away from customers and unknown bookings', async () => {
    const asCustomer = await call('PATCH', `/staff/bookings/${IDS.UNKNOWN}/status`, {
      body: { to_status: 'cancelled', note: 'x' },
      token: accounts.customer,
    })
    expect([asCustomer.status, (await changeStatus(IDS.UNKNOWN, 'cancelled', 'x')).status]).toEqual(
      [403, 404],
    )
  })
})

describe('a booking from confirmation to closed', () => {
  const inspect = (booking_id, type) =>
    staff('POST', '/staff/inspections', { booking_id, type, fuel_level: 'full', mileage_km: 1000 })

  // The document and inspection rules are tested in workflow.test.js; this is the happy path through the API.
  it('takes a booking from confirmation to closed', async () => {
    const { id } = await newBooking()
    await changeStatus(id, 'confirmed', 'Deposit received')
    const { rows } = await db.query('select customer_id from bookings where id = $1', [id])
    await insertVerifiedDocuments(db, { booking: id, owner: rows[0].customer_id })
    expect((await changeStatus(id, 'ready')).status).toBe(200)
    await inspect(id, 'pickup')
    expect((await changeStatus(id, 'active')).status).toBe(200)
    await inspect(id, 'return')
    expect((await changeStatus(id, 'returned')).status).toBe(200)
    expect((await changeStatus(id, 'closed')).body.data.status).toBe('closed')
  })
})

describe('assigning a vehicle and driver', () => {
  it('needs a driver for a delivery and records it', async () => {
    const { id } = await newBooking({ quote: officeQuote({ handover: deliveryHandover }) })
    const assign = (body) => staff('POST', `/staff/bookings/${id}/assign`, body)
    expect((await assign({ vehicle_id: IDS.KAA_002 })).status).toBe(400)
    expect((await assign({ vehicle_id: IDS.KAA_002, driver_id: IDS.DRIVER })).status).toBe(200)
    const { rows } = await db.query('select driver_id from deliveries where booking_id = $1', [id])
    expect(rows[0].driver_id).toBe(IDS.DRIVER)
  })

  it('refuses a vehicle that another booking holds for the same dates', async () => {
    const first = await newBooking()
    const second = await newBooking()
    const { rows } = await db.query('select vehicle_id from bookings where id = $1', [second.id])
    const response = await staff('POST', `/staff/bookings/${first.id}/assign`, {
      vehicle_id: rows[0].vehicle_id,
    })
    expect(errorOf(response)).toEqual([409, 'BOOKING_OVERLAP'])
  })
})
