import { describe, expect, it } from 'vitest'
import { IDS, accounts, call, errorOf, get, signUpCustomer, withApi } from './api-client.js'

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

// A pending company may set up before it is approved, so a fresh sign-up is enough to try the console.
const newOperator = async (name) => {
  const { token } = await signUpCustomer()
  await start(token, name)
  return token
}
const mine = (token, method, path, body) => call(method, `/operator${path}`, { body, token })
const vehicle = (suffix) => ({
  registration: `API-${suffix}`,
  chassis_number: `API-CHASSIS-${suffix}`,
  class_id: IDS.SEDAN,
})

describe('the operator console', () => {
  it('is only for a rental company', async () => {
    expect(errorOf(await mine(accounts.staff, 'GET', '/overview'))[0]).toBe(403)
    expect(errorOf(await mine(accounts.customer, 'GET', '/vehicles'))[0]).toBe(403)
    const token = await newOperator('API Console Guard')
    expect((await call('GET', '/admin/overview', { token })).status).toBe(403)
  })

  it('shows a new company where it stands and what is left to set up', async () => {
    const token = await newOperator('API Console Today')
    await mine(token, 'POST', '/vehicles', vehicle('CON-T'))
    const { body } = await mine(token, 'GET', '/overview')
    expect(body.data).toMatchObject({
      company: { status: 'pending', is_complete: false },
      vehicles: 1,
      vehicles_total: 1,
      rates: 0,
      services: 0,
      vehicles_without_rate: 1,
      pickups_today: 0,
    })
  })
})

describe('the operator console: fleet and classes', () => {
  it('adds a vehicle for its own company and lists only its own', async () => {
    const [one, two] = await Promise.all([
      newOperator('API Console A'),
      newOperator('API Console B'),
    ])
    const created = await mine(one, 'POST', '/vehicles', vehicle('CON-1'))
    expect(created.status).toBe(201)
    expect((await mine(one, 'GET', '/vehicles')).body.data).toHaveLength(1)
    expect((await mine(two, 'GET', '/vehicles')).body.data).toHaveLength(0)
    expect(
      errorOf(await mine(two, 'PATCH', `/vehicles/${created.body.data.id}`, { mileage_km: 5 }))[0],
    ).toBe(404)
  })

  it('adds a class of its own that starts private, beside the platform list', async () => {
    const token = await newOperator('API Console Classes')
    const made = await mine(token, 'POST', '/classes', { name: 'API Safari Cruiser', seats: 7 })
    expect(made.body.data).toMatchObject({
      is_public: false,
      slug: 'api-console-classes-api-safari-cruiser',
    })
    expect(
      (await mine(token, 'PATCH', `/classes/${made.body.data.id}`, { is_public: true })).status,
    ).toBe(400)
    const names = (await mine(token, 'GET', '/classes')).body.data.map((item) => item.name)
    expect(names).toContain('API Safari Cruiser')
    expect(names.length).toBeGreaterThan(1)
  })
})

describe('the operator console: prices and places', () => {
  it('prices its own classes and leaves what renters are charged alone', async () => {
    const [one, two] = await Promise.all([
      newOperator('API Console R1'),
      newOperator('API Console R2'),
    ])
    const before = JSON.stringify((await get('/classes')).body)
    const rate = { class_id: IDS.SEDAN, price_kes: 1000, effective_from: '2026-01-01' }
    expect((await mine(one, 'POST', '/rates', rate)).status).toBe(201)
    expect((await mine(two, 'POST', '/rates', rate)).status).toBe(201)
    expect(errorOf(await mine(one, 'POST', '/rates', { ...rate, price_kes: 2000 }))[0]).toBe(409)
    expect(JSON.stringify((await get('/classes')).body)).toBe(before)
  }, 20_000)

  it('serves every airport by default, and stops serving one when switched off', async () => {
    const token = await newOperator('API Console Places')
    const all = (await mine(token, 'GET', '/airports')).body.data
    expect(all.length).toBeGreaterThan(20)
    expect(all.every((place) => place.is_served)).toBe(true)
    const off = await mine(token, 'PUT', `/airports/${all[0].id}`, { is_served: false })
    expect(off.body.data).toMatchObject({ is_served: false })
    expect(
      (await mine(token, 'GET', '/airports')).body.data.filter((p) => !p.is_served),
    ).toHaveLength(1)
    await mine(token, 'PUT', `/airports/${all[0].id}`, { is_served: true })
    expect((await mine(token, 'GET', '/airports')).body.data.every((p) => p.is_served)).toBe(true)
  })

  it('adds its own airstrip without showing it to renters, and changes its details but not its status', async () => {
    const token = await newOperator('API Console Own')
    const place = { name: 'API Private Strip', type: 'airstrip', address: 'Laikipia' }
    const made = await mine(token, 'POST', '/places', place)
    expect(made.body.data).toMatchObject({ is_served: false, type: 'airstrip' })
    expect((await get('/locations')).body.data.map((item) => item.name)).not.toContain(
      'API Private Strip',
    )
    const company = await mine(token, 'PATCH', '/company', { phone: '+254700000999' })
    expect(company.body.data.phone).toBe('+254700000999')
    expect((await mine(token, 'PATCH', '/company', { status: 'approved' })).status).toBe(400)
  })
})
