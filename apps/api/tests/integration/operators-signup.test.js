import { describe, expect, it } from 'vitest'
import { actAs, actAsOwner, attempt, ids, withSeededTransaction } from './helpers.js'

// The one way an account becomes a rental company's: register_operator (supabase/migrations/20261124000003).
// Kept apart from operators.test.js, which holds the tenancy rules and is at the file length limit.
const client = withSeededTransaction()

const register = (userId, name = 'Fresh Cars') =>
  actAs(client, userId).then(() =>
    attempt(client, "select * from register_operator($1, '+254700000123')", [name]),
  )

describe('a rental company signing itself up', () => {
  const profileOf = async (userId) =>
    (await client.query('select role, operator_id from profiles where id = $1', [userId])).rows[0]

  it('makes a customer the first person of a new company that waits for review', async () => {
    const result = await register(ids.custA)
    expect(result.error).toBeNull()
    expect(result.rows[0]).toMatchObject({
      business_name: 'Fresh Cars',
      status: 'pending',
      slug: 'fresh-cars',
    })
    await actAsOwner(client)
    expect(await profileOf(ids.custA)).toEqual({ role: 'operator', operator_id: result.rows[0].id })
  })

  it('does not show a company to renters until it is approved', async () => {
    await register(ids.custA)
    await actAs(client, null)
    expect(
      (await client.query("select id from public_operators where business_name = 'Fresh Cars'"))
        .rowCount,
    ).toBe(0)
  })

  it('gives two companies with one name different addresses', async () => {
    const first = await register(ids.custA)
    const second = await register(ids.custB, 'Fresh Cars')
    expect(second.error?.message).toContain('FORBIDDEN')
    await actAsOwner(client)
    await client.query('update profiles set company_id = null where id = $1', [ids.custB])
    const retry = await register(ids.custB, 'Fresh Cars')
    expect(retry.rows[0].slug).not.toBe(first.rows[0].slug)
  })
})

describe('who may not start a company', () => {
  it.each([
    [
      'one that already has a company',
      () => register(ids.custA).then(() => register(ids.custA)),
      'CONFLICT',
    ],
    ['staff', () => register(ids.staff), 'FORBIDDEN'],
    ['an admin', () => register(ids.admin), 'FORBIDDEN'],
    ['a corporate user', () => register(ids.approver), 'FORBIDDEN'],
    // A guest is stopped before the function runs: it is not granted to anyone signed out.
    ['a guest', () => register(null), 'permission denied'],
  ])('refuses %s', async (_name, run, code) => {
    expect((await run()).error?.message).toContain(code)
  })

  it('refuses a name that is too short', async () => {
    expect((await register(ids.custA, 'A')).error?.message).toContain('VALIDATION_FAILED')
  })
})
