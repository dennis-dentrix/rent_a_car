import { beforeEach, describe, expect, it } from 'vitest'
import { actAs, actAsOwner, attempt, ids, isBlocked, withSeededTransaction } from './helpers.js'
import { insertOperatorOwner, opIds, seedOperators, vehicleInsert } from './operators-helpers.js'

const client = withSeededTransaction()
beforeEach(() => seedOperators(client))

const idsOf = async (sql, params = []) =>
  (await client.query(sql, params)).rows.map((row) => row.id)

describe('what an operator can see', () => {
  beforeEach(() => actAs(client, opIds.userA))

  it('sees only its own operator, vehicles, and bookings', async () => {
    expect(await idsOf('select id from operators')).toEqual([opIds.opA])
    expect(await idsOf('select id from vehicles')).toEqual([opIds.vehA])
    expect(await idsOf('select id from bookings')).toEqual([opIds.bookingA])
  })

  it('sees the renter of its own booking but not a renter of another operator', async () => {
    const renters = await idsOf('select id from profiles where id = any($1)', [
      [ids.custA, ids.custB],
    ])
    expect(renters).toEqual([ids.custA])
  })

  it('does not see the legacy platform fleet', async () => {
    expect(await idsOf('select id from vehicles where id = $1', [ids.veh1])).toEqual([])
  })
})

describe('what an operator can write', () => {
  beforeEach(() => actAs(client, opIds.userA))

  it('adds a vehicle for itself', async () => {
    const result = await attempt(client, ...vehicleInsert(opIds.opA, 'NEW 001A'))
    expect(result.error).toBeNull()
  })

  it('cannot add a vehicle for another operator or for no operator', async () => {
    expect(isBlocked(await attempt(client, ...vehicleInsert(opIds.opB, 'NEW 002A')))).toBe(true)
    expect(isBlocked(await attempt(client, ...vehicleInsert(null, 'NEW 003A')))).toBe(true)
  })

  it("cannot change another operator's vehicle or move its own to them", async () => {
    const other = await attempt(client, "update vehicles set status = 'retired' where id = $1", [
      opIds.vehB,
    ])
    expect(isBlocked(other)).toBe(true)
    const move = await attempt(client, 'update vehicles set operator_id = $2 where id = $1', [
      opIds.vehA,
      opIds.opB,
    ])
    expect(isBlocked(move)).toBe(true)
  })

  it('cannot change prices or status on a booking', async () => {
    const result = await attempt(client, 'update bookings set total_kes = 1 where id = $1', [
      opIds.bookingA,
    ])
    expect(isBlocked(result)).toBe(true)
  })
})

describe('operator details and handover', () => {
  beforeEach(() => actAs(client, opIds.userA))

  it('edits its contact details but not its status or plan', async () => {
    const phone = await attempt(client, "update operators set phone = '+254700000002'")
    expect(phone.rowCount).toBe(1)
    const status = await attempt(client, "update operators set status = 'approved'")
    expect(status.error?.code).toBe('42501')
    const plan = await attempt(client, "update operators set plan = 'free_launch'")
    expect(plan.error?.code).toBe('42501')
  })

  it('records an inspection on its own booking only', async () => {
    const sql =
      "insert into handover_records (booking_id, type, vehicle_id, recorded_at) values ($1, 'pickup', $2, now())"
    expect((await attempt(client, sql, [opIds.bookingA, opIds.vehA])).error).toBeNull()
    expect(isBlocked(await attempt(client, sql, [opIds.bookingB, opIds.vehB]))).toBe(true)
  })
})

describe('a suspended operator', () => {
  beforeEach(async () => {
    await actAsOwner(client)
    await client.query("update operators set status = 'suspended' where id = $1", [opIds.opA])
    await actAs(client, opIds.userA)
  })

  it('still reads its records but cannot add or change them', async () => {
    expect(await idsOf('select id from vehicles')).toEqual([opIds.vehA])
    expect(isBlocked(await attempt(client, ...vehicleInsert(opIds.opA, 'NEW 004A')))).toBe(true)
    const update = await attempt(client, "update vehicles set status = 'retired'")
    expect(isBlocked(update)).toBe(true)
  })
})

describe('joining an operator', () => {
  it('is not possible by editing your own profile', async () => {
    await actAs(client, ids.custA)
    const join = await attempt(client, 'update profiles set operator_id = $2 where id = $1', [
      ids.custA,
      opIds.opA,
    ])
    expect(isBlocked(join)).toBe(true)
    const both = await attempt(
      client,
      "update profiles set role = 'operator', operator_id = $2 where id = $1",
      [ids.custA, opIds.opA],
    )
    expect(isBlocked(both)).toBe(true)
  })

  it('needs the role and the operator together', async () => {
    const result = await attempt(client, "update profiles set role = 'operator' where id = $1", [
      ids.custA,
    ])
    expect(result.error?.code).toBe('23514')
  })
})

describe('booking operator', () => {
  it('follows the vehicle, including when the vehicle changes', async () => {
    const operatorOf = async (id) =>
      (await client.query('select operator_id from bookings where id = $1', [id])).rows[0]
        .operator_id
    expect(await operatorOf(opIds.bookingA)).toBe(opIds.opA)
    expect(await operatorOf(ids.bookingA)).toBeNull()
    const moveTo = (vehicle) =>
      client.query('update bookings set vehicle_id = $2 where id = $1', [opIds.bookingA, vehicle])
    await moveTo(ids.veh1)
    expect(await operatorOf(opIds.bookingA)).toBeNull()
    await moveTo(opIds.vehA)
    expect(await operatorOf(opIds.bookingA)).toBe(opIds.opA)
  })
})

describe('guests and customers', () => {
  it('read no operator details, only approved names through the view', async () => {
    await actAs(client, null)
    expect(isBlocked(await attempt(client, 'select id from operators'))).toBe(true)
    const names = await client.query('select * from public_operators order by business_name')
    expect(names.rows.map((row) => row.business_name)).toEqual(['Operator A', 'Operator B'])
    expect(Object.keys(names.rows[0]).sort()).toEqual(['business_name', 'id', 'slug'])
  })

  it('leave unapproved operators out of the view', async () => {
    await client.query("update operators set status = 'pending' where id = $1", [opIds.opA])
    await actAs(client, ids.custA)
    expect(await idsOf('select id from public_operators')).toEqual([opIds.opB])
  })
})

describe('availability', () => {
  const free = async () =>
    (
      await client.query(
        "select available_vehicle_count($1, '2027-03-01', '2027-03-03') as count",
        [ids.cls],
      )
    ).rows[0].count

  it('counts vehicles of approved operators only', async () => {
    expect(await free()).toBe(4)
    await client.query("update operators set status = 'suspended' where id = $1", [opIds.opA])
    expect(await free()).toBe(3)
  })
})

const AGREEMENT =
  "insert into ownership_agreements (owner_id, vehicle_id, commission_percent, starts_on) values ($1, $2, 10, '2026-01-01')"

describe('owner records', () => {
  it("are invisible to other operators, including an owner's private details", async () => {
    const ownerB = await insertOperatorOwner(client, opIds.opB, 'Owner of B')
    await client.query(
      'insert into vehicle_owner_private (owner_id, national_id_number) values ($1, $2)',
      [ownerB, '12345678'],
    )
    await actAs(client, opIds.userA)
    expect(await idsOf('select id from vehicle_owners')).toEqual([])
    expect(await idsOf('select owner_id as id from vehicle_owner_private')).toEqual([])
    await actAs(client, opIds.userB)
    expect(await idsOf('select owner_id as id from vehicle_owner_private')).toEqual([ownerB])
  })

  it("cannot be linked to another operator's vehicle or agreement", async () => {
    const ownerB = await insertOperatorOwner(client, opIds.opB, 'Owner of B')
    await actAs(client, opIds.userA)
    const link = await attempt(client, 'update vehicles set owner_id = $2 where id = $1', [
      opIds.vehA,
      ownerB,
    ])
    expect(link.error?.message).toContain('VALIDATION_FAILED')
    const agreement = await attempt(client, AGREEMENT, [ownerB, opIds.vehA])
    expect(agreement.error?.message).toContain('VALIDATION_FAILED')
  })

  it('link to its own vehicle through an agreement', async () => {
    await actAs(client, opIds.userA)
    const own = await attempt(
      client,
      "insert into vehicle_owners (full_name, phone, operator_id) values ('Mine', '+254711000098', $1) returning id",
      [opIds.opA],
    )
    const agreement = await attempt(client, AGREEMENT, [own.rows[0].id, opIds.vehA])
    expect(agreement.error).toBeNull()
  })
})

const PENDING = '00000000-0000-4000-8000-000000000603'

const addPendingOperator = () =>
  client.query(
    "insert into operators (id, business_name, slug) values ($1, 'Pending Co', 'pending-co')",
    [PENDING],
  )

const review = (operator, status, reason = null) =>
  attempt(client, 'select * from review_operator($1, $2, $3)', [operator, status, reason])

describe('who can review an operator', () => {
  beforeEach(addPendingOperator)

  it('lets an admin approve, and records who and when', async () => {
    await actAs(client, ids.admin)
    const result = await review(PENDING, 'approved')
    expect(result.error).toBeNull()
    expect(result.rows[0]).toMatchObject({ status: 'approved', verified_by: ids.admin })
    expect(result.rows[0].verified_at).not.toBeNull()
    await actAsOwner(client)
    const log = await client.query(
      "select actor_id from audit_log where table_name = 'operators' and row_id = $1 and action = 'UPDATE'",
      [PENDING],
    )
    expect(log.rows).toEqual([{ actor_id: ids.admin }])
  })

  it.each([
    ['staff', ids.staff],
    ['an operator', opIds.userA],
    ['a customer', ids.custA],
  ])('refuses %s', async (_name, user) => {
    await actAs(client, user)
    expect((await review(PENDING, 'approved')).error?.message).toContain('FORBIDDEN')
  })
})

describe('the rules of a review', () => {
  beforeEach(addPendingOperator)

  it('needs a reason to reject or suspend', async () => {
    await actAs(client, ids.admin)
    expect((await review(PENDING, 'rejected')).error?.message).toContain('VALIDATION_FAILED')
    expect((await review(opIds.opA, 'suspended', '  ')).error?.message).toContain(
      'VALIDATION_FAILED',
    )
  })

  it('follows the allowed moves only', async () => {
    await actAs(client, ids.admin)
    expect((await review(opIds.opA, 'rejected', 'late')).error?.message).toContain(
      'INVALID_STATUS_TRANSITION',
    )
    expect((await review(opIds.opA, 'suspended', 'complaints')).error).toBeNull()
    expect((await review(opIds.opA, 'approved')).error).toBeNull()
  })
})
