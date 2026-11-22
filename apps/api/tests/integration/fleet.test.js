import { beforeEach, describe, expect, it } from 'vitest'
import {
  actAs,
  attempt,
  ids,
  insertAgreement,
  insertInspection,
  insertInspectionFile,
  insertOwner,
  insertOwnerWithPrivateDetails,
  insertTracker,
  withSeededTransaction,
} from './helpers.js'

const UNIQUE_VIOLATION = '23505'
const NOT_NULL_VIOLATION = '23502'
const CHECK_VIOLATION = '23514'
const EXCLUSION_VIOLATION = '23P01'

const client = withSeededTransaction()

const addVehicle = (chassis) =>
  attempt(
    client,
    "insert into vehicles (registration, chassis_number, class_id) values ('KZZ 999Z', $1, $2)",
    [chassis, ids.cls],
  )

const insertInspectionWithFile = async () => {
  const inspection = await insertInspection(client)
  await insertInspectionFile(client, inspection.rows[0].id)
}

describe('chassis numbers', () => {
  it('requires a chassis number on every vehicle', async () => {
    const result = await addVehicle(null)
    expect(result.error?.code).toBe(NOT_NULL_VIOLATION)
  })

  it('rejects a duplicate chassis number whatever the letter case', async () => {
    const result = await addVehicle('fixturechassis001')
    expect(result.error?.code).toBe(UNIQUE_VIOLATION)
  })

  it('rejects a chassis number that is too short', async () => {
    expect((await addVehicle('AB')).error?.code).toBe(CHECK_VIOLATION)
  })
})

describe('vehicle owners and agreements', () => {
  it('sets the vehicle owner when the first agreement is made', async () => {
    const owner = await insertOwner(client)
    await insertAgreement(client, owner, ids.veh1)
    const { rows } = await client.query('select owner_id from vehicles where id = $1', [ids.veh1])
    expect(rows[0].owner_id).toBe(owner)
  })

  it('rejects an agreement for a vehicle that belongs to another owner', async () => {
    await insertAgreement(client, await insertOwner(client), ids.veh1)
    const second = await insertOwner(client, 'Owner Two', '+254711000012')
    const result = await insertAgreement(client, second, ids.veh1, '2027-06-01')
    expect(result.error?.message).toContain('CONFLICT')
  })

  it('rejects overlapping agreements on one vehicle', async () => {
    const owner = await insertOwner(client)
    await insertAgreement(client, owner, ids.veh1, '2026-01-01', '2026-12-31')
    const result = await insertAgreement(client, owner, ids.veh1, '2026-06-01')
    expect(result.error?.code).toBe(EXCLUSION_VIOLATION)
  })

  it('rejects a commission above 100 percent', async () => {
    const owner = await insertOwner(client)
    const result = await attempt(
      client,
      "insert into ownership_agreements (owner_id, vehicle_id, commission_percent, starts_on) values ($1, $2, 120, '2026-01-01')",
      [owner, ids.veh1],
    )
    expect(result.error?.code).toBe(CHECK_VIOLATION)
  })
})

describe('owner records access', () => {
  let owner

  beforeEach(async () => {
    owner = await insertOwnerWithPrivateDetails(client)
  })

  it('lets staff read owners but not their private details', async () => {
    await actAs(client, ids.staff)
    const readable = await attempt(client, 'select id from vehicle_owners where id = $1', [owner])
    const hidden = await attempt(
      client,
      'select owner_id from vehicle_owner_private where owner_id = $1',
      [owner],
    )
    expect([readable.rowCount, hidden.rowCount]).toEqual([1, 0])
  })

  it('lets an admin read private owner details', async () => {
    await actAs(client, ids.admin)
    const result = await attempt(
      client,
      'select owner_id from vehicle_owner_private where owner_id = $1',
      [owner],
    )
    expect(result.rowCount).toBe(1)
  })
})

describe('owner records write access', () => {
  it('stops staff and customers writing owner records', async () => {
    for (const user of [ids.staff, ids.custA]) {
      await actAs(client, user)
      const result = await attempt(
        client,
        "insert into vehicle_owners (full_name, phone) values ('X', '+254700')",
      )
      expect(result.error).not.toBeNull()
    }
  })

  it('hides owner records from customers and guests', async () => {
    await actAs(client, ids.custA)
    expect((await attempt(client, 'select id from vehicle_owners')).rowCount).toBe(0)
    await actAs(client, null)
    expect((await attempt(client, 'select id from vehicle_owners')).rowCount).toBe(0)
  })
})

describe('trackers', () => {
  it('allows only one active tracker per vehicle', async () => {
    await insertTracker(client, ids.veh1, 'IMEI-1')
    expect((await insertTracker(client, ids.veh1, 'IMEI-2')).error?.code).toBe(UNIQUE_VIOLATION)
  })

  it('allows a new tracker once the old one is removed', async () => {
    await insertTracker(client, ids.veh1, 'IMEI-1', 'removed')
    expect((await insertTracker(client, ids.veh1, 'IMEI-2')).error).toBeNull()
  })

  it('rejects the same device on two vehicles', async () => {
    await insertTracker(client, ids.veh1, 'IMEI-1')
    expect((await insertTracker(client, ids.veh2, 'IMEI-1')).error?.code).toBe(UNIQUE_VIOLATION)
  })

  it('lets staff read trackers but not change them', async () => {
    await insertTracker(client, ids.veh1, 'IMEI-1')
    await actAs(client, ids.staff)
    const read = await attempt(client, "select id from vehicle_trackers where device_id = 'IMEI-1'")
    const write = await attempt(
      client,
      "update vehicle_trackers set status = 'faulty' where device_id = 'IMEI-1'",
    )
    expect([read.rowCount, write.rowCount]).toEqual([1, 0])
  })
})

describe('inspection reports', () => {
  it("accepts an inspection for the booking's vehicle", async () => {
    expect((await insertInspection(client)).error).toBeNull()
  })

  it('rejects an inspection of a different vehicle than the booking', async () => {
    const result = await insertInspection(client, { vehicle: ids.veh2 })
    expect(result.error?.message).toContain('VALIDATION_FAILED')
  })

  it('stores photos and documents against the inspection', async () => {
    const inspection = await insertInspection(client)
    expect((await insertInspectionFile(client, inspection.rows[0].id)).error).toBeNull()
  })

  it('rejects a file larger than 10 MB', async () => {
    const inspection = await insertInspection(client)
    const result = await insertInspectionFile(client, inspection.rows[0].id, { size: 10485761 })
    expect(result.error?.code).toBe(CHECK_VIOLATION)
  })

  it('keeps inspection files append-only', async () => {
    await insertInspectionWithFile()
    expect((await attempt(client, "update inspection_files set label = 'x'")).error).not.toBeNull()
  })
})

describe('inspection file access', () => {
  beforeEach(insertInspectionWithFile)

  const visibleTo = async (user) => {
    await actAs(client, user)
    return (await attempt(client, 'select id from inspection_files')).rowCount
  }

  it('shows files to the customer who rented and to staff', async () => {
    expect(await visibleTo(ids.custA)).toBe(1)
    expect(await visibleTo(ids.staff)).toBe(1)
  })

  it("hides files from another customer's rental", async () => {
    expect(await visibleTo(ids.custB)).toBe(0)
  })
})
