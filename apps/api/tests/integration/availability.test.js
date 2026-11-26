import { beforeEach, describe, expect, it } from 'vitest'
import {
  actAs,
  actAsOwner,
  attempt,
  bookingInsert,
  ids,
  isBlocked,
  withSeededTransaction,
} from './helpers.js'
import { opIds, seedOperators } from './operators-helpers.js'

const client = withSeededTransaction()
beforeEach(() => seedOperators(client))

// Operator A's car is booked 10 to 12 December 2026 (operators-helpers.js).
const BOOKED = ['2026-12-10', '2026-12-12']
const OPEN = ['2027-03-01', '2027-03-04']

const block = (vehicle, [start, end]) =>
  attempt(client, 'insert into vehicle_blocks (vehicle_id, start_at, end_at) values ($1, $2, $3)', [
    vehicle,
    start,
    end,
  ])

const book = (vehicle, [start, end], status = 'confirmed') =>
  attempt(
    client,
    ...bookingInsert({
      reference: `BLK-${vehicle}`,
      customer: ids.custA,
      vehicle,
      start,
      end,
      status,
    }),
  )

describe('blocking dates', () => {
  it('stops a booking of the car on those dates', async () => {
    await block(opIds.vehA, OPEN)
    expect((await book(opIds.vehA, ['2027-03-03', '2027-03-06'])).error?.message).toBe(
      'BOOKING_OVERLAP',
    )
  })

  it('leaves the days after it, other cars, and bookings that hold nothing', async () => {
    await block(opIds.vehA, OPEN)
    expect((await book(opIds.vehA, ['2027-03-04', '2027-03-06'])).error).toBeNull()
    expect((await book(opIds.vehB, OPEN)).error).toBeNull()
  })

  it('does not stop a cancelled booking', async () => {
    await block(opIds.vehA, OPEN)
    expect((await book(opIds.vehA, OPEN, 'cancelled')).error).toBeNull()
  })

  it('is refused over a booking that holds the car', async () => {
    expect((await block(opIds.vehA, BOOKED)).error?.message).toBe('BOOKING_OVERLAP')
  })

  it('cannot overlap another block of the same car, or end before it starts', async () => {
    await block(opIds.vehA, OPEN)
    expect((await block(opIds.vehA, ['2027-03-02', '2027-03-08'])).error).not.toBeNull()
    expect((await block(opIds.vehA, ['2027-04-02', '2027-04-01'])).error).not.toBeNull()
  })
})

describe('who can block a car', () => {
  beforeEach(() => actAs(client, opIds.userA))

  it("lets a company block and free its own car, but not another company's", async () => {
    expect((await block(opIds.vehA, OPEN)).error).toBeNull()
    expect(isBlocked(await block(opIds.vehB, OPEN))).toBe(true)
    const removed = await attempt(client, 'delete from vehicle_blocks where vehicle_id = $1', [
      opIds.vehA,
    ])
    expect(removed.rowCount).toBe(1)
  })

  it('hides blocks from other companies, renters, and guests', async () => {
    await block(opIds.vehA, OPEN)
    for (const viewer of [opIds.userB, ids.custA, null]) {
      await actAs(client, viewer)
      const seen = await attempt(client, 'select id from vehicle_blocks')
      expect(seen.rows).toEqual([])
    }
  })
})

describe('cars free for chosen dates', () => {
  const price = (vehicle, kes) =>
    client.query('update vehicles set daily_rate_kes = $2 where id = $1', [vehicle, kes])
  const freeCars = async ([start, end]) => {
    await actAs(client, null)
    const { rows } = await client.query('select id, daily_rate_kes from free_cars($1, $2)', [
      start,
      end,
    ])
    await actAsOwner(client)
    const ours = [opIds.vehA, opIds.vehB]
    return rows
      .map((row) => row.id)
      .filter((id) => ours.includes(id))
      .sort()
  }

  beforeEach(async () => {
    await price(opIds.vehA, 4000)
    await price(opIds.vehB, 6000)
  })

  it('leaves out a car that is booked or blocked', async () => {
    expect(await freeCars(BOOKED)).toEqual([])
    await block(opIds.vehA, OPEN)
    expect(await freeCars(OPEN)).toEqual([opIds.vehB])
  })

  it('leaves out a car with no price or whose company is not approved', async () => {
    await price(opIds.vehA, null)
    await client.query("update operators set status = 'suspended' where id = $1", [opIds.opB])
    expect(await freeCars(OPEN)).toEqual([])
  })
})

describe('a booking priced for a car', () => {
  const carQuote = async (vehicle) =>
    (
      await client.query(
        `insert into quotes (class_id, vehicle_id, start_at, end_at, handover_type, total_kes,
           deposit_kes, breakdown, expires_at)
         values ($1, $2, $3, $4, 'office', 12000, 0, '[]', now() + interval '1 hour') returning id`,
        [ids.cls, vehicle, ...OPEN],
      )
    ).rows[0].id
  const bookQuote = async (quote) =>
    attempt(client, 'select vehicle_id from create_booking_from_quote($1, $2, null)', [
      quote,
      ids.custA,
    ])
  const change = (quote, column, value) =>
    attempt(client, `update bookings set ${column} = $2 where quote_id = $1`, [quote, value])

  it('takes that car', async () => {
    expect((await bookQuote(await carQuote(opIds.vehB))).rows[0].vehicle_id).toBe(opIds.vehB)
  })

  it('is refused when that car is blocked, though others of its class are free', async () => {
    await block(opIds.vehB, OPEN)
    const result = await bookQuote(await carQuote(opIds.vehB))
    expect(result.error?.message).toBe('BOOKING_OVERLAP')
  })

  it('cannot be moved to another car, or repriced for one', async () => {
    const quote = await carQuote(opIds.vehB)
    await bookQuote(quote)
    expect((await change(quote, 'vehicle_id', opIds.vehA)).error?.message).toBe('BOOKING_OVERLAP')
    for (const other of [await carQuote(opIds.vehA), await carQuote(null)]) {
      expect((await change(quote, 'quote_id', other)).error?.message).toBe('VALIDATION_FAILED')
    }
  })
})

const pricedQuote = async () => {
  await client.query('update vehicles set daily_rate_kes = 4000 where id = $1', [opIds.vehB])
  const { rows } = await client.query(
    `insert into quotes (class_id, vehicle_id, start_at, end_at, handover_type, total_kes,
       deposit_kes, breakdown, expires_at)
     values ($1, $2, $3, $4, 'office', 12000, 0, '[]', now() + interval '1 hour') returning id`,
    [ids.cls, opIds.vehB, ...OPEN],
  )
  return rows[0].id
}
const bookAged = async (bornOn, extra = '') =>
  attempt(client, `select * from book_car($1, $2, $3, 'Naivasha', 'Nairobi'${extra})`, [
    await pricedQuote(),
    ids.custA,
    bornOn,
  ])
// The stay starts on 1 March 2027, and the platform's minimum age is 21.
const TWENTY_ONE = '2006-03-01'

describe('booking a car instantly', () => {
  it('confirms at once, with no hold to expire, and keeps the trip details', async () => {
    const { rows, error } = await bookAged(TWENTY_ONE)
    expect(error).toBeNull()
    expect(rows[0]).toMatchObject({
      status: 'confirmed',
      hold_expires_at: null,
      destination: 'Naivasha',
      vehicle_id: opIds.vehB,
    })
  })

  it('refuses a renter a day short of the minimum age', async () => {
    expect((await bookAged('2006-03-02')).error?.message).toBe('UNDER_MINIMUM_AGE')
  })

  it("applies the company's higher age, and its class rule over its general one", async () => {
    const rule = (classId, age) =>
      client.query(
        'insert into operator_policies (operator_id, class_id, min_age) values ($1, $2, $3)',
        [opIds.opB, classId, age],
      )
    await rule(null, 25)
    expect((await bookAged(TWENTY_ONE)).error?.message).toBe('UNDER_MINIMUM_AGE')
    await rule(ids.cls, 21)
    expect((await bookAged(TWENTY_ONE)).error).toBeNull()
  })
})

describe('drop-off and pick-up', () => {
  const asked = ', true, true'

  it('refuses what the company does not offer', async () => {
    expect((await bookAged(TWENTY_ONE, asked)).error?.message).toBe('VALIDATION_FAILED')
  })

  it('records what the renter asks of a company that offers both', async () => {
    await client.query(
      'update operators set offers_dropoff = true, offers_pickup = true where id = $1',
      [opIds.opB],
    )
    const { rows } = await bookAged(TWENTY_ONE, asked)
    expect(rows[0]).toMatchObject({ wants_dropoff: true, wants_pickup: true })
  })

  it('needs the pick up location', async () => {
    const result = await attempt(client, "select book_car($1, $2, '1990-01-01', 'Naivasha', ' ')", [
      await pricedQuote(),
      ids.custA,
    ])
    expect(result.error?.message).toBe('VALIDATION_FAILED')
  })
})

describe('booking a car that may not be booked', () => {
  it('refuses a car whose company is no longer approved', async () => {
    const quote = await pricedQuote()
    await client.query("update operators set status = 'suspended' where id = $1", [opIds.opB])
    const result = await attempt(
      client,
      "select book_car($1, $2, '1990-01-01', 'Naivasha', 'Nairobi')",
      [quote, ids.custA],
    )
    expect(result.error?.message).toBe('NOT_FOUND')
  })

  it('cannot be called by a renter directly', async () => {
    const quote = await pricedQuote()
    await actAs(client, ids.custA)
    const result = await attempt(
      client,
      "select book_car($1, $2, '1990-01-01', 'Naivasha', 'Nairobi')",
      [quote, ids.custA],
    )
    expect(result.error).not.toBeNull()
  })
})
