import { beforeEach, describe, expect, it } from 'vitest'
import {
  actAs,
  actAsOwner,
  approveRefund,
  attempt,
  bookingInsert,
  ids,
  insertBooking,
  insertDocument,
  insertVerifiedDocuments,
  isBlocked,
  requestRefund,
  transition,
  withSeededTransaction,
} from './helpers.js'
import { opIds, seedOperators } from './operators-helpers.js'

const EXCLUSION_VIOLATION = '23P01'
const INSUFFICIENT_PRIVILEGE = '42501'

const client = withSeededTransaction()

const countRows = async (table) => (await attempt(client, `select id from ${table}`)).rowCount
const selectIds = async (table) => (await client.query(`select id from ${table}`)).rows

describe('double booking', () => {
  // Seed books ids.veh1 from 1 to 4 December for ids.bookingA.
  const overlapping = (status) => ({
    reference: 'X1',
    customer: ids.custB,
    vehicle: ids.veh1,
    start: '2026-12-03',
    end: '2026-12-06',
    status,
  })

  it('rejects an overlapping booking on the same vehicle', async () => {
    const result = await attempt(client, ...bookingInsert(overlapping('pending_payment')))
    expect(result.error?.code).toBe(EXCLUSION_VIOLATION)
  })

  it('allows the same dates once the earlier booking is cancelled', async () => {
    await client.query("select set_config('app.via_transition', 'on', true)")
    await client.query("update bookings set status = 'cancelled' where id = $1", [ids.bookingA])
    const result = await attempt(client, ...bookingInsert(overlapping('confirmed')))
    expect(result.error).toBeNull()
  })
})

describe('booking status', () => {
  it('rejects a direct status update', async () => {
    const result = await attempt(client, "update bookings set status = 'active' where id = $1", [
      ids.bookingA,
    ])
    expect(result.error?.message).toContain('INVALID_STATUS_TRANSITION')
  })

  it('moves status through transition_booking and writes the event', async () => {
    await insertVerifiedDocuments(client)
    await transition(client, ids.bookingA, 'ready', ids.staff, 'docs ok')
    const events = await client.query(
      'select from_status, to_status from booking_status_events where booking_id = $1',
      [ids.bookingA],
    )
    expect(events.rows).toEqual([{ from_status: 'confirmed', to_status: 'ready' }])
  })

  it('rejects a move that is not in the transition table', async () => {
    const result = await attempt(client, 'select transition_booking($1, $2, $3, $4)', [
      ids.bookingA,
      'active',
      ids.staff,
      null,
    ])
    expect(result.error?.message).toContain('INVALID_STATUS_TRANSITION')
  })

  it('keeps status events append-only', async () => {
    await insertVerifiedDocuments(client)
    await transition(client, ids.bookingA, 'ready', ids.staff)
    const result = await attempt(client, "update booking_status_events set note = 'x'")
    expect(result.error?.message).toContain('append-only')
  })
})

describe('rates', () => {
  it('rejects overlapping rate periods for a class', async () => {
    await client.query(
      "insert into rates (class_id, price_kes, effective_from, effective_to) values ($1, 10000, '2026-01-01', '2026-12-31')",
      [ids.cls],
    )
    const result = await attempt(
      client,
      "insert into rates (class_id, price_kes, effective_from) values ($1, 11000, '2026-06-01')",
      [ids.cls],
    )
    expect(result.error?.code).toBe(EXCLUSION_VIOLATION)
  })
})

describe('RLS: guest', () => {
  beforeEach(() => actAs(client, null))

  it('reads public classes but not vehicles or bookings', async () => {
    expect(await countRows('vehicle_classes')).toBeGreaterThanOrEqual(1)
    expect(await countRows('vehicles')).toBe(0)
    expect(await countRows('bookings')).toBe(0)
  })
})

describe('RLS: customer', () => {
  beforeEach(() => actAs(client, ids.custA))

  it('sees only their own bookings', async () => {
    expect(await selectIds('bookings')).toEqual([{ id: ids.bookingA }])
  })

  it('cannot change their own role', async () => {
    const result = await attempt(client, "update profiles set role = 'admin' where id = $1", [
      ids.custA,
    ])
    expect(isBlocked(result)).toBe(true)
    await actAsOwner(client)
    const { rows } = await client.query('select role from profiles where id = $1', [ids.custA])
    expect(rows[0].role).toBe('customer')
  })

  it('cannot edit booking totals', async () => {
    const result = await attempt(client, 'update bookings set total_kes = 1 where id = $1', [
      ids.bookingA,
    ])
    expect(result.rowCount).toBe(0)
  })

  it("cannot see another customer's documents", async () => {
    await actAs(client, ids.custB)
    expect(await countRows('documents')).toBe(0)
  })
})

describe('RLS: corporate approver', () => {
  it("sees a company booking's agreement but not the renter's ID or licence", async () => {
    const booking = ids.bookingB
    await insertDocument(client, { owner: ids.custB, booking, type: 'national_id' })
    await insertDocument(client, { owner: ids.custB, booking, type: 'agreement' })
    await actAs(client, ids.approver)
    const { rows } = await client.query('select type from documents')
    expect(rows).toEqual([{ type: 'agreement' }])
  })

  it('sees only their company bookings', async () => {
    await actAs(client, ids.approver)
    expect(await selectIds('bookings')).toEqual([{ id: ids.bookingB }])
  })
})

describe('RLS: operator', () => {
  it("never sees its renters' identity documents", async () => {
    await seedOperators(client)
    await insertDocument(client, { owner: ids.custA, booking: opIds.bookingA })
    await actAs(client, opIds.userA)
    expect(await countRows('documents')).toBe(0)
  })
})

describe('RLS: staff', () => {
  beforeEach(() => actAs(client, ids.staff))

  it('cannot edit rates', async () => {
    const result = await attempt(
      client,
      "insert into rates (class_id, price_kes, effective_from) values ($1, 1, '2030-01-01')",
      [ids.cls],
    )
    expect(result.error).not.toBeNull()
  })

  it('can review a document status but not change the stored file path', async () => {
    const review = await attempt(
      client,
      "update documents set status = 'verified', reviewed_by = $2 where id = $1",
      [ids.docA, ids.staff],
    )
    expect(review.rowCount).toBe(1)
    const path = await attempt(client, "update documents set storage_path = 'x' where id = $1", [
      ids.docA,
    ])
    expect(path.error?.code).toBe(INSUFFICIENT_PRIVILEGE)
  })

  it('can request a refund but not approve one', async () => {
    const request = await requestRefund(client, ids.staff)
    expect(request.error).toBeNull()
    const approve = await approveRefund(client, request.rows[0].id, ids.staff)
    expect(approve.rowCount).toBe(0)
  })
})

describe('RLS: admin', () => {
  it('cannot approve a refund they requested', async () => {
    await actAs(client, ids.admin)
    const request = await requestRefund(client, ids.admin)
    const approve = await approveRefund(client, request.rows[0].id, ids.admin)
    expect(approve.error).not.toBeNull()
  })
})

describe('RLS: signed-in user with no profile row', () => {
  it('is denied access to bookings', async () => {
    await actAsOwner(client)
    await client.query('insert into auth.users (id, email) values ($1, $2)', [
      ids.ghost,
      'ghost@example.invalid',
    ])
    // Sign-up creates a profile, so remove it to get an account with none.
    await client.query('delete from profiles where id = $1', [ids.ghost])
    await actAs(client, ids.ghost)
    expect(await countRows('bookings')).toBe(0)
  })
})

describe('seed helpers', () => {
  it('inserts a booking with a generated id', async () => {
    await insertBooking(client, {
      reference: 'Z9',
      customer: ids.custA,
      vehicle: ids.veh2,
      start: '2027-01-01',
      end: '2027-01-03',
    })
    const { rowCount } = await client.query('select 1 from bookings where reference = $1', ['Z9'])
    expect(rowCount).toBe(1)
  })
})

describe('a profile picture', () => {
  it('may only name a file in the person’s own folder', async () => {
    const own = await attempt(client, 'update profiles set avatar_path = $2 where id = $1', [
      ids.custA,
      `avatars/${ids.custA}/a.jpg`,
    ])
    const theirs = await attempt(client, 'update profiles set avatar_path = $2 where id = $1', [
      ids.custA,
      `avatars/${ids.custB}/a.jpg`,
    ])
    expect(own.error).toBeNull()
    expect(theirs.error?.code).toBe('23514')
  })
})
