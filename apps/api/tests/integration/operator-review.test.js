import { beforeEach, describe, expect, it } from 'vitest'
import { actAs, actAsOwner, attempt, ids, withSeededTransaction } from './helpers.js'
import { opIds, seedOperators } from './operators-helpers.js'

const client = withSeededTransaction()
const PENDING = '00000000-0000-4000-8000-000000000603'

beforeEach(async () => {
  await seedOperators(client)
  await client.query(
    "insert into operators (id, business_name, slug) values ($1, 'Pending Co', 'pending-co')",
    [PENDING],
  )
})

const review = (operator, status, reason = null) =>
  attempt(client, 'select * from review_operator($1, $2, $3)', [operator, status, reason])

describe('reviewing an operator', () => {
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
