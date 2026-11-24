import { describe, expect, it } from 'vitest'
import { accounts, call, errorOf, signUpCustomer, withApi } from './api-client.js'

withApi()

const admin = (method, path, body) => call(method, path, { body, token: accounts.admin })
const start = (token, name = 'API Fleet One') =>
  call('POST', '/me/operator', { body: { business_name: name, phone: '+254700000321' }, token })

describe('starting a company', () => {
  it('turns a new customer into the first person of a pending company, shown by /me', async () => {
    const { token } = await signUpCustomer()
    const created = await start(token)
    expect(created.status).toBe(201)
    expect(created.body.data).toMatchObject({ business_name: 'API Fleet One', status: 'pending' })
    const me = await call('GET', '/me', { token })
    expect(me.body.data).toMatchObject({
      role: 'operator',
      operator: { business_name: 'API Fleet One', status: 'pending' },
    })
  })

  it('answers a second try with a conflict, and refuses staff', async () => {
    const { token } = await signUpCustomer()
    await start(token, 'API Fleet Two')
    expect(errorOf(await start(token, 'API Fleet Two again'))).toEqual([409, 'CONFLICT'])
    expect(errorOf(await start(accounts.staff))).toEqual([403, 'FORBIDDEN'])
  })

  it('needs a name', async () => {
    const { token } = await signUpCustomer()
    const response = await call('POST', '/me/operator', { body: { business_name: 'A' }, token })
    expect(errorOf(response)).toEqual([400, 'VALIDATION_FAILED'])
  })
})

const pendingId = async (name) => {
  const { token } = await signUpCustomer()
  return (await start(token, name)).body.data.id
}

describe("the admin's review", () => {
  it('lists the companies waiting, approves one, and says why when it refuses one', async () => {
    const approvedId = await pendingId('API Fleet Three')
    const rejectedId = await pendingId('API Fleet Four')
    const queue = await admin('GET', '/admin/operators?status=pending')
    expect(queue.body.data.map((row) => row.id)).toEqual(
      expect.arrayContaining([approvedId, rejectedId]),
    )
    const approved = await admin('POST', `/admin/operators/${approvedId}/review`, {
      to: 'approved',
    })
    expect(approved.body.data).toMatchObject({ status: 'approved' })
    const noReason = await admin('POST', `/admin/operators/${rejectedId}/review`, {
      to: 'rejected',
    })
    expect(errorOf(noReason)).toEqual([400, 'VALIDATION_FAILED'])
    const rejected = await admin('POST', `/admin/operators/${rejectedId}/review`, {
      to: 'rejected',
      reason: 'No insurance certificate.',
    })
    expect(rejected.body.data).toMatchObject({
      status: 'rejected',
      status_reason: 'No insurance certificate.',
    })
  })
})

describe('who may review', () => {
  it('is for admin only, and a company cannot approve itself', async () => {
    const { token } = await signUpCustomer()
    const id = (await start(token, 'API Fleet Five')).body.data.id
    const self = await call('POST', `/admin/operators/${id}/review`, {
      body: { to: 'approved' },
      token,
    })
    expect(errorOf(self)).toEqual([403, 'FORBIDDEN'])
    expect(errorOf(await call('GET', '/admin/operators', { token: accounts.staff }))).toEqual([
      403,
      'FORBIDDEN',
    ])
  })
})
