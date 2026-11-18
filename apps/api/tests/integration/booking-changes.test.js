import { describe, expect, it } from 'vitest'
import {
  IDS,
  asCustomer,
  accounts,
  bookNewQuote,
  call,
  changeStatus,
  deliveryHandover,
  newBooking,
  officeQuote,
  withApi,
} from './api-client.js'

const db = withApi()

const bookingOf = async (quoteOverrides) =>
  (await bookNewQuote(undefined, undefined, quoteOverrides)).body.data

/** A booking the customer made online, confirmed by staff, so its deposit counts as received. */
async function confirmedBooking() {
  const booking = await bookingOf()
  await changeStatus(booking.id, 'confirmed', 'Deposit received')
  return booking
}

/** Make the booking start `hours` from now, as if pickup were that close. */
const startsInHours = (id, hours) =>
  db.query(
    `update bookings set start_at = now() + make_interval(hours => $2),
       end_at = now() + make_interval(hours => $2) + interval '3 days' where id = $1`,
    [id, hours],
  )

describe('cancelling more than 24 hours before pickup', () => {
  it('shows the refund before the customer confirms', async () => {
    const { id } = await confirmedBooking()
    const { body } = await asCustomer('GET', `/bookings/${id}/cancellation`)
    expect(body.data).toMatchObject({
      policy_window: 'full_refund',
      refund_kes: 11250,
      can_cancel: true,
    })
  })

  it('refunds the deposit in full and records what is owed', async () => {
    const { id } = await confirmedBooking()
    const { status, body } = await asCustomer('POST', `/bookings/${id}/cancel`, {
      reason: 'Plans changed',
    })
    const { rows } = await db.query(
      'select refund_due_kes, cancelled_at from bookings where id = $1',
      [id],
    )
    expect([status, body.data]).toEqual([
      200,
      { status: 'cancelled', refund_kes: 11250, policy_window: 'full_refund' },
    ])
    expect([rows[0].refund_due_kes, rows[0].cancelled_at === null]).toEqual([11250, false])
  })

  it('refunds nothing when the deposit was never received', async () => {
    const { id } = await bookingOf()
    const { body } = await asCustomer('POST', `/bookings/${id}/cancel`, {})
    expect(body.data).toEqual({ status: 'cancelled', refund_kes: 0, policy_window: 'nothing_paid' })
  })
})

describe('cancelling inside the 24-hour window', () => {
  it('refuses until the customer acknowledges that no refund is due', async () => {
    const { id } = await confirmedBooking()
    await startsInHours(id, 5)
    const refused = await asCustomer('POST', `/bookings/${id}/cancel`, {})
    expect([refused.status, refused.body.error.details]).toEqual([
      400,
      { acknowledged_no_refund: expect.any(String) },
    ])
  })

  it('shows no refund, and cancels with the acknowledgement', async () => {
    const { id } = await confirmedBooking()
    await startsInHours(id, 5)
    const preview = await asCustomer('GET', `/bookings/${id}/cancellation`)
    const done = await asCustomer('POST', `/bookings/${id}/cancel`, {
      acknowledged_no_refund: true,
    })
    expect([preview.body.data.policy_window, preview.body.data.refund_kes]).toEqual([
      'no_refund',
      0,
    ])
    expect(done.body.data).toEqual({
      status: 'cancelled',
      refund_kes: 0,
      policy_window: 'no_refund',
    })
  })
})

describe('who can cancel', () => {
  it("hides another customer's booking and refuses a second cancellation", async () => {
    const { id } = await bookingOf()
    expect((await asCustomer('POST', `/bookings/${id}/cancel`, {}, accounts.other)).status).toBe(
      404,
    )
    await asCustomer('POST', `/bookings/${id}/cancel`, {})
    expect((await asCustomer('POST', `/bookings/${id}/cancel`, {})).status).toBe(422)
  })

  it('records the refund owed when staff cancel too', async () => {
    const { id } = await confirmedBooking()
    await changeStatus(id, 'cancelled', 'Customer phoned to cancel')
    const { rows } = await db.query('select refund_due_kes from bookings where id = $1', [id])
    expect(rows[0].refund_due_kes).toBe(11250)
  })
})

describe('changing dates', () => {
  const newDates = { start_at: '2027-04-01T08:00:00+03:00', end_at: '2027-04-05T08:00:00+03:00' }
  const change = (id, body = newDates, token) => asCustomer('PATCH', `/bookings/${id}`, body, token)

  it('prices the new dates again from the rate table', async () => {
    const { id } = await bookingOf()
    const { status, body } = await change(id)
    expect(status).toBe(200)
    expect(body.data.booking).toMatchObject({
      total_kes: 50000,
      deposit_kes: 15000,
      date_changes: 1,
    })
    expect(body.data.breakdown[0].label).toBe('Vehicle, 4 day(s)')
  })

  it('keeps a deposit already received and moves the difference to the balance', async () => {
    const { id } = await confirmedBooking()
    const { body } = await change(id)
    expect(body.data.booking).toMatchObject({
      total_kes: 50000,
      deposit_kes: 11250,
      balance_kes: 38750,
    })
  })
})

describe('how many changes, and how late', () => {
  const newDates = { start_at: '2027-04-01T08:00:00+03:00', end_at: '2027-04-05T08:00:00+03:00' }
  const change = (id, body = newDates) => asCustomer('PATCH', `/bookings/${id}`, body)

  it('allows one change only', async () => {
    const { id } = await bookingOf()
    await change(id)
    expect(
      (
        await change(id, {
          start_at: '2027-05-01T08:00:00+03:00',
          end_at: '2027-05-03T08:00:00+03:00',
        })
      ).status,
    ).toBe(400)
  })

  it('refuses a change too close to pickup', async () => {
    const { id } = await bookingOf()
    await startsInHours(id, 5)
    expect((await change(id)).status).toBe(400)
  })
})

describe('changing dates when the vehicle is busy', () => {
  const D2 = { start_at: '2027-04-01T08:00:00+03:00', end_at: '2027-04-04T08:00:00+03:00' }
  const move = (id) => asCustomer('PATCH', `/bookings/${id}`, D2)
  const bookStaff = (vehicle_id) => newBooking({ vehicle_id, quote: officeQuote(D2) })

  it('uses another vehicle of the class when its own is taken', async () => {
    const { id } = await bookingOf()
    await bookStaff(IDS.KAA_001)
    const { status } = await move(id)
    const { rows } = await db.query('select vehicle_id from bookings where id = $1', [id])
    expect([status, rows[0].vehicle_id]).toEqual([200, IDS.KAA_002])
  })

  it('refuses when every vehicle of the class is taken for the new dates', async () => {
    const { id } = await bookingOf()
    await bookStaff(IDS.KAA_001)
    await bookStaff(IDS.KAA_002)
    const { status, body } = await move(id)
    expect([status, body.error.code]).toEqual([409, 'BOOKING_OVERLAP'])
  })

  it('moves a delivery window with the new date', async () => {
    const { id } = await bookingOf({ handover: deliveryHandover })
    await move(id)
    const { rows } = await db.query('select window_start from deliveries where booking_id = $1', [
      id,
    ])
    expect(rows[0].window_start.toISOString()).toBe('2027-04-01T04:00:00.000Z')
  })
})

describe('changing dates: invalid requests', () => {
  it.each([
    [
      'an end before the start',
      { start_at: '2027-04-05T08:00:00+03:00', end_at: '2027-04-01T08:00:00+03:00' },
    ],
    [
      'a start in the past',
      { start_at: '2020-01-01T08:00:00+03:00', end_at: '2020-01-04T08:00:00+03:00' },
    ],
    ['a field that is not a date', { start_at: 'soon', end_at: 'later' }],
  ])('rejects %s', async (_name, body) => {
    const { id } = await bookingOf()
    expect((await asCustomer('PATCH', `/bookings/${id}`, body)).status).toBe(400)
  })

  it("hides another customer's booking and unknown ids", async () => {
    const { id } = await bookingOf()
    const dates = { start_at: '2027-04-01T08:00:00+03:00', end_at: '2027-04-04T08:00:00+03:00' }
    expect((await asCustomer('PATCH', `/bookings/${id}`, dates, accounts.other)).status).toBe(404)
    expect((await asCustomer('PATCH', `/bookings/${IDS.UNKNOWN}`, dates)).status).toBe(404)
  })
})
