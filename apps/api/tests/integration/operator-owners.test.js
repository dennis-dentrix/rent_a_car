import { beforeEach, describe, expect, it } from 'vitest'
import { actAs, attempt, withSeededTransaction } from './helpers.js'
import { insertOperatorOwner, opIds, seedOperators } from './operators-helpers.js'

const client = withSeededTransaction()
beforeEach(() => seedOperators(client))

const idsOf = async (sql) => (await client.query(sql)).rows.map((row) => row.id)

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
