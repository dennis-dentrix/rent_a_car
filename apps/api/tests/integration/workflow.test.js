import { describe, expect, it } from 'vitest'
import {
  actAs,
  attempt,
  ids,
  insertDocument,
  insertInspection,
  insertVerifiedDocuments,
  tryTransition,
  withSeededTransaction,
} from './helpers.js'

const client = withSeededTransaction()

const errorOf = (result) => result.error?.message

const readyError = async () => errorOf(await tryTransition(client, ids.bookingA, 'ready'))

describe('status rules: documents', () => {
  it('stops a booking becoming ready before its documents are verified', async () => {
    expect(await readyError()).toBe('DOCUMENTS_NOT_VERIFIED')
  })

  it('lets it become ready once ID, licence, and agreement are verified', async () => {
    await insertVerifiedDocuments(client)
    expect((await tryTransition(client, ids.bookingA, 'ready')).error).toBeNull()
  })

  it('needs the ID and licence verified, not only the agreement', async () => {
    await insertDocument(client, {
      booking: ids.bookingA,
      type: 'agreement',
      status: 'verified',
    })
    expect(errorOf(await tryTransition(client, ids.bookingA, 'ready'))).toBe(
      'DOCUMENTS_NOT_VERIFIED',
    )
  })
})

describe('status rules: inspections', () => {
  const readyBooking = async () => {
    await insertVerifiedDocuments(client)
    await tryTransition(client, ids.bookingA, 'ready')
  }

  it('needs a pickup inspection before the booking is active', async () => {
    await readyBooking()
    expect(errorOf(await tryTransition(client, ids.bookingA, 'active'))).toBe('INSPECTION_REQUIRED')
    await insertInspection(client, { type: 'pickup' })
    expect((await tryTransition(client, ids.bookingA, 'active')).error).toBeNull()
  })

  it('needs a return inspection before the booking is returned', async () => {
    await readyBooking()
    await insertInspection(client, { type: 'pickup' })
    await tryTransition(client, ids.bookingA, 'active')
    expect(errorOf(await tryTransition(client, ids.bookingA, 'returned'))).toBe(
      'INSPECTION_REQUIRED',
    )
    await insertInspection(client, { type: 'return' })
    expect((await tryTransition(client, ids.bookingA, 'returned')).error).toBeNull()
  })
})

describe('staff status changes', () => {
  const staffChange = (to, note = null, booking = ids.bookingA) =>
    attempt(client, 'select staff_transition_booking($1, $2, $3)', [booking, to, note])

  it('refuses a customer', async () => {
    await actAs(client, ids.custA)
    expect(errorOf(await staffChange('cancelled', 'changed my mind'))).toBe('FORBIDDEN')
  })

  it('needs a note to cancel', async () => {
    await actAs(client, ids.staff)
    expect(errorOf(await staffChange('cancelled'))).toBe('VALIDATION_FAILED')
  })

  it('records the staff member as the actor', async () => {
    await actAs(client, ids.staff)
    expect((await staffChange('cancelled', 'Customer called to cancel')).error).toBeNull()
    const { rows } = await client.query(
      'select actor_id, note from booking_status_events where booking_id = $1',
      [ids.bookingA],
    )
    expect(rows).toEqual([{ actor_id: ids.staff, note: 'Customer called to cancel' }])
  })

  it('writes the change to the audit log with who made it', async () => {
    await actAs(client, ids.staff)
    await staffChange('cancelled', 'Customer called to cancel')
    await client.query('reset role')
    const { rows } = await client.query(
      "select actor_id from audit_log where table_name = 'bookings' and row_id = $1 and action = 'UPDATE'",
      [ids.bookingA],
    )
    expect(rows.map((row) => row.actor_id)).toContain(ids.staff)
  })
})

describe('assigning a vehicle', () => {
  const assign = (vehicle, driver = null, booking = ids.bookingA) =>
    attempt(client, 'select assign_booking($1, $2, $3)', [booking, vehicle, driver])

  const addSpareVehicle = async () => {
    const { rows } = await client.query(
      "insert into vehicles (registration, chassis_number, class_id) values ('TEST 003A', 'FIXTURECHASSIS003', $1) returning id",
      [ids.cls],
    )
    return rows[0].id
  }

  it('moves a booking to a free vehicle of the same class', async () => {
    await actAs(client, ids.staff)
    await client.query('reset role')
    const spare = await addSpareVehicle()
    await actAs(client, ids.staff)
    expect((await assign(spare)).error).toBeNull()
  })

  it('refuses a vehicle that is booked for the same dates', async () => {
    await actAs(client, ids.staff)
    expect(errorOf(await assign(ids.veh2))).toBe('BOOKING_OVERLAP')
  })

  it('refuses a vehicle of a different class', async () => {
    await actAs(client, ids.staff)
    const prado = '77777777-7777-4777-8777-000000000003'
    expect(errorOf(await assign(prado))).toBe('VALIDATION_FAILED')
  })

  it('refuses a driver on an office pickup', async () => {
    await actAs(client, ids.staff)
    const driver = '88888888-8888-4888-8888-000000000001'
    expect(errorOf(await assign(ids.veh1, driver))).toBe('VALIDATION_FAILED')
  })

  it('refuses a customer', async () => {
    await actAs(client, ids.custA)
    expect((await assign(ids.veh1)).error).not.toBeNull()
  })
})
