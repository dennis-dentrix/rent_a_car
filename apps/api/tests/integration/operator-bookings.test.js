import { beforeEach, describe, expect, it } from 'vitest'
import {
  actAs,
  actAsOwner,
  attempt,
  ids,
  insertDocument,
  insertInspection,
  insertVerifiedDocuments,
  withSeededTransaction,
} from './helpers.js'
import { opIds, seedOperators } from './operators-helpers.js'

const client = withSeededTransaction()
beforeEach(() => seedOperators(client))

// Operator A's confirmed booking by custA (operators-helpers.js).
const BOOKING = opIds.bookingA
const as = async (user, sql, params) => {
  await actAs(client, user)
  return attempt(client, sql, params)
}
const move = (to, { user = opIds.userA, note = null } = {}) =>
  as(user, 'select status from operator_move_booking($1, $2, $3)', [BOOKING, to, note])
const errorOf = async (result) => (await result).error?.message

describe('a company moving its booking', () => {
  it('needs checked documents and the agreement before the car is ready', async () => {
    expect(await errorOf(move('ready'))).toBe('DOCUMENTS_NOT_VERIFIED')
    await actAsOwner(client)
    await insertVerifiedDocuments(client, { booking: BOOKING })
    expect((await move('ready')).rows[0].status).toBe('ready')
  })

  it('needs the pickup report before the hire starts', async () => {
    await insertVerifiedDocuments(client, { booking: BOOKING })
    await move('ready')
    expect(await errorOf(move('active'))).toBe('INSPECTION_REQUIRED')
    await actAsOwner(client)
    await insertInspection(client, { booking: BOOKING, vehicle: opIds.vehA })
    expect((await move('active')).rows[0].status).toBe('active')
  })

  it('may cancel with a reason, and may not confirm or expire', async () => {
    expect(await errorOf(move('cancelled'))).toBe('VALIDATION_FAILED')
    expect(await errorOf(move('expired', { note: 'x' }))).toBe('INVALID_STATUS_TRANSITION')
    expect((await move('cancelled', { note: 'Car broke down' })).error).toBeNull()
  })

  it("cannot touch another company's booking, and neither can its renter", async () => {
    for (const user of [opIds.userB, ids.custA]) {
      expect(await errorOf(move('cancelled', { user, note: 'x' }))).toBe('NOT_FOUND')
    }
  })
})

const FILE = '00000000-0000-4000-8000-000000000911'
const list = (user = opIds.userA) =>
  as(user, 'select id, status from operator_documents($1)', [BOOKING])
const open = (reason, user = opIds.userA) =>
  as(user, 'select storage_path from operator_open_document($1, $2, $3)', [BOOKING, FILE, reason])
const review = (status, reason = null) =>
  as(opIds.userA, 'select operator_review_document($1, $2, $3, $4)', [
    BOOKING,
    FILE,
    status,
    reason,
  ])

describe("a company checking its renter's ID", () => {
  beforeEach(() => insertDocument(client, { id: FILE, booking: BOOKING }))

  it('lists them for its own booking only', async () => {
    // The renter's own ID, uploaded for no booking in particular, counts too (helpers.js seed).
    const seen = (await list()).rows.map((row) => row.id).sort()
    expect(seen).toEqual([ids.docA, FILE].sort())
    expect(await errorOf(list(opIds.userB))).toBe('NOT_FOUND')
  })

  it('opens one only with a reason, and logs who and why', async () => {
    expect(await errorOf(open(' '))).toBe('VALIDATION_FAILED')
    expect((await open('Checking before pickup')).error).toBeNull()
    await actAsOwner(client)
    const { rows } = await client.query('select accessed_by, reason from document_access_log')
    expect(rows).toEqual([{ accessed_by: opIds.userA, reason: 'Checking before pickup' }])
  })

  it('accepts one, or rejects it saying why', async () => {
    expect(await errorOf(review('rejected'))).toBe('VALIDATION_FAILED')
    expect((await review('verified')).error).toBeNull()
    expect((await list()).rows).toContainEqual({ id: FILE, status: 'verified' })
  })

  it('loses sight of them once the hire is over', async () => {
    await move('cancelled', { note: 'x' })
    expect(await errorOf(list())).toBe('NOT_FOUND')
    expect(await errorOf(open('Looking back'))).toBe('NOT_FOUND')
  })
})

describe('recording what was paid at handover', () => {
  // The booking's total is 10,000 (helpers.js).
  const pay = (amount, reference = null, user = opIds.userA) =>
    as(user, 'select record_handover_payment($1, $2, $3, $4)', [BOOKING, 'cash', amount, reference])

  it('adds up to no more than the total', async () => {
    expect((await pay(6000)).error).toBeNull()
    expect(await errorOf(pay(4001))).toBe('VALIDATION_FAILED')
    expect((await pay(4000)).error).toBeNull()
  })

  it('takes a payment reference once, from this company only', async () => {
    await pay(1000, 'QAB123')
    expect((await pay(1000, 'QAB123')).error).not.toBeNull()
    expect(await errorOf(pay(1000, null, opIds.userB))).toBe('NOT_FOUND')
  })
})

const offerOnRequest = () =>
  client.query(
    "update vehicles set daily_rate_kes = 4000, booking_mode = 'request' where id = $1",
    [opIds.vehB],
  )

const REQUEST_STAY = ['2027-03-01', '2027-03-04']
const request = async (renter = ids.custA) => {
  const quote = await client.query(
    `insert into quotes (class_id, vehicle_id, start_at, end_at, handover_type, total_kes,
       deposit_kes, breakdown, expires_at)
     values ($1, $2, $3, $4, 'office', 12000, 0, '[]', now() + interval '1 hour') returning id`,
    [ids.cls, opIds.vehB, ...REQUEST_STAY],
  )
  return attempt(client, "select * from book_car($1, $2, '1990-01-01', 'Naivasha', 'Nairobi')", [
    quote.rows[0].id,
    renter,
  ])
}
const answerAs = async (booking, accept, { user = opIds.userB, reason = null } = {}) => {
  await actAs(client, user)
  const result = await attempt(client, 'select status from answer_request($1, $2, $3)', [
    booking,
    accept,
    reason,
  ])
  await actAsOwner(client)
  return result
}
const requestStatus = async (id) =>
  (await client.query('select status from bookings where id = $1', [id])).rows[0].status

describe('asking to book a car', () => {
  beforeEach(offerOnRequest)

  it('waits for the company, with a time to answer by, and holds nothing', async () => {
    const first = (await request()).rows[0]
    expect(first.status).toBe('requested')
    expect(first.hold_expires_at.getTime()).toBeGreaterThan(Date.now())
    expect((await request(ids.custB)).rows[0].status).toBe('requested')
  })

  it('is confirmed when the company accepts, and a second yes for the same dates is refused', async () => {
    const [first, second] = [(await request()).rows[0].id, (await request(ids.custB)).rows[0].id]
    expect((await answerAs(first, true)).rows[0].status).toBe('confirmed')
    expect((await answerAs(second, true)).error?.message).toBe('BOOKING_OVERLAP')
  })

  it('is declined only with a reason', async () => {
    const id = (await request()).rows[0].id
    expect((await answerAs(id, false)).error?.message).toBe('VALIDATION_FAILED')
    expect((await answerAs(id, false, { reason: 'Car in service' })).rows[0].status).toBe(
      'declined',
    )
  })
})

describe('who answers a request, and by when', () => {
  beforeEach(offerOnRequest)

  it("is answered by the car's own company only", async () => {
    const id = (await request()).rows[0].id
    for (const user of [opIds.userA, ids.custA]) {
      expect((await answerAs(id, true, { user })).error?.message).toBe('NOT_FOUND')
    }
  })

  it('expires without an answer, and cannot be accepted late', async () => {
    const id = (await request()).rows[0].id
    await client.query(
      "update bookings set hold_expires_at = now() - interval '1 minute' where id = $1",
      [id],
    )
    expect((await answerAs(id, true)).error?.message).toBe('INVALID_STATUS_TRANSITION')
    await client.query('select expire_unanswered_requests()')
    expect(await requestStatus(id)).toBe('expired')
  })
})

describe('telling the renter of a change', () => {
  beforeEach(offerOnRequest)
  const newsFor = async (renter) => {
    await actAs(client, renter)
    const { rows } = await client.query('select booking_updates from my_alerts()')
    await actAsOwner(client)
    return rows[0].booking_updates
  }
  const openAs = async (renter, booking) => {
    await actAs(client, renter)
    await client.query('select mark_booking_seen($1)', [booking])
    await actAsOwner(client)
  }

  it('says nothing about what the renter did, and flags what the company did', async () => {
    const id = (await request()).rows[0].id
    expect(await newsFor(ids.custA)).toBe(0)
    await answerAs(id, true)
    expect(await newsFor(ids.custA)).toBe(1)
  })

  it('clears when the renter opens the booking, and nobody else can clear it', async () => {
    const id = (await request()).rows[0].id
    await answerAs(id, true)
    await openAs(ids.custB, id)
    expect(await newsFor(ids.custA)).toBe(1)
    await openAs(ids.custA, id)
    expect(await newsFor(ids.custA)).toBe(0)
  })
})
