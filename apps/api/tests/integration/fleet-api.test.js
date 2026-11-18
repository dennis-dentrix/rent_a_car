import { describe, expect, it } from 'vitest'
import { IDS, accounts, bookNewQuote, call, withApi } from './api-client.js'

let counter = 0
const db = withApi()

/** Call a route as one of the seeded accounts (admin, staff, customer). */
const as = (who, method, path, { body } = {}) => call(method, path, { body, token: accounts[who] })

const vehicleBody = (overrides = {}) => {
  counter += 1
  return {
    registration: `API-${counter}`,
    chassis_number: `APICHASSIS${String(counter).padStart(5, '0')}`,
    class_id: IDS.SEDAN,
    make: 'Toyota',
    model: 'Camry',
    year: 2024,
    ...overrides,
  }
}

const addVehicle = async (overrides) =>
  (await as('admin', 'POST', '/admin/vehicles', { body: vehicleBody(overrides) })).body.data

const addOwner = async (overrides = {}) =>
  (
    await as('admin', 'POST', '/admin/vehicle-owners', {
      body: { full_name: 'API Owner', phone: '+254711000020', ...overrides },
    })
  ).body.data

const addAgreement = (ownerId, vehicleId, overrides = {}) =>
  as('admin', 'POST', `/admin/vehicle-owners/${ownerId}/agreements`, {
    body: { vehicle_id: vehicleId, commission_percent: 20, starts_on: '2026-01-01', ...overrides },
  })

const staffView = async (vehicleId) =>
  (await as('staff', 'GET', `/staff/vehicles/${vehicleId}`)).body.data

describe('access control', () => {
  it('requires a signed-in user', async () => {
    const { status } = await call('POST', '/admin/vehicles', { body: {} })
    expect(status).toBe(401)
  })

  it('keeps admin routes away from staff and customers', async () => {
    for (const who of ['staff', 'customer']) {
      const { status } = await as(who, 'GET', '/admin/vehicle-owners')
      expect(status).toBe(403)
    }
  })

  it('keeps staff routes away from customers', async () => {
    const { status } = await as('customer', 'GET', '/staff/vehicles')
    expect(status).toBe(403)
  })
})

describe('vehicles and chassis numbers', () => {
  it('records the chassis number when an admin adds a vehicle', async () => {
    const vehicle = await addVehicle()
    expect(vehicle.chassis_number).toMatch(/^APICHASSIS/)
    expect((await staffView(vehicle.id)).is_partner_vehicle).toBe(false)
  })

  it('rejects a vehicle without a chassis number', async () => {
    const { chassis_number: _omit, ...body } = vehicleBody()
    const { status } = await as('admin', 'POST', '/admin/vehicles', { body })
    expect(status).toBe(400)
  })

  it('rejects a duplicate chassis number with a conflict', async () => {
    const first = await addVehicle()
    const again = vehicleBody({ chassis_number: first.chassis_number.toLowerCase() })
    const { status } = await as('admin', 'POST', '/admin/vehicles', {
      body: again,
    })
    expect(status).toBe(409)
  })
})

describe('vehicle management', () => {
  it('lets staff list vehicles but not add them', async () => {
    const list = await as('staff', 'GET', '/staff/vehicles?limit=2')
    const add = await as('staff', 'POST', '/admin/vehicles', {
      body: vehicleBody(),
    })
    expect([list.status, list.body.data.length, add.status]).toEqual([200, 2, 403])
  })

  it('updates a vehicle and rejects an empty update', async () => {
    const { id } = await addVehicle()
    const path = `/admin/vehicles/${id}`
    const ok = await as('admin', 'PATCH', path, {
      id,
      body: { status: 'maintenance' },
    })
    const empty = await as('admin', 'PATCH', path, { body: {} })
    expect([ok.body.data.status, empty.status]).toEqual(['maintenance', 400])
  })

  it('returns not found for an unknown or malformed vehicle id', async () => {
    const unknown = await as('staff', 'GET', `/staff/vehicles/${IDS.UNKNOWN}`)
    const malformed = await as('staff', 'GET', '/staff/vehicles/abc')
    expect([unknown.status, malformed.status]).toEqual([404, 404])
  })
})

describe('private owners and agreements', () => {
  it('creates an owner with private details that only an admin can read', async () => {
    const owner = await addOwner({
      private: { national_id_number: '12345678', payout_method: 'mpesa' },
    })
    const read = await as('admin', 'GET', `/admin/vehicle-owners/${owner.id}`)
    expect(read.body.data.private.national_id_number).toBe('12345678')
  })

  it('marks a vehicle as a partner vehicle once an owner has an agreement', async () => {
    const vehicle = await addVehicle()
    const owner = await addOwner()
    expect((await addAgreement(owner.id, vehicle.id)).status).toBe(201)
    const view = await staffView(vehicle.id)
    expect(view).toMatchObject({ is_partner_vehicle: true, owner: { full_name: 'API Owner' } })
    expect(view.agreements[0].commission_percent).toBe(20)
  })

  it('shows staff the owner without private details', async () => {
    const vehicle = await addVehicle()
    const owner = await addOwner({ private: { national_id_number: '12345678' } })
    await addAgreement(owner.id, vehicle.id)
    const view = await staffView(vehicle.id)
    expect(JSON.stringify(view)).not.toContain('12345678')
  })
})

describe('ownership agreement rules', () => {
  it('rejects an agreement for a vehicle another owner already has', async () => {
    const vehicle = await addVehicle()
    await addAgreement((await addOwner()).id, vehicle.id)
    const second = await addOwner({ full_name: 'API Owner Two', phone: '+254711000021' })
    expect((await addAgreement(second.id, vehicle.id, { starts_on: '2027-06-01' })).status).toBe(
      409,
    )
  })

  it('rejects a commission above 100 percent', async () => {
    const vehicle = await addVehicle()
    const { status } = await addAgreement((await addOwner()).id, vehicle.id, {
      commission_percent: 120,
    })
    expect(status).toBe(400)
  })

  it('lists the vehicles and agreements on an owner', async () => {
    const vehicle = await addVehicle()
    const owner = await addOwner()
    await addAgreement(owner.id, vehicle.id)
    const read = await as('admin', 'GET', `/admin/vehicle-owners/${owner.id}`)
    expect([read.body.data.vehicles.length, read.body.data.agreements.length]).toEqual([1, 1])
  })
})

describe('trackers', () => {
  const trackerBody = (device = 'API-IMEI-1') => ({
    provider: 'Test Telematics',
    device_id: device,
  })
  const addTracker = (vehicleId, body = trackerBody()) =>
    as('admin', 'POST', `/admin/vehicles/${vehicleId}/trackers`, { body })

  it('records a tracker that staff can see on the vehicle', async () => {
    const { id } = await addVehicle()
    expect((await addTracker(id)).status).toBe(201)
    expect((await staffView(id)).trackers[0]).toMatchObject({
      device_id: 'API-IMEI-1',
      status: 'active',
    })
  })

  it('allows one active tracker per vehicle and a new one once the old is removed', async () => {
    const { id } = await addVehicle()
    const first = (await addTracker(id)).body.data
    expect((await addTracker(id, trackerBody('API-IMEI-2'))).status).toBe(409)
    const removed = { status: 'removed', removed_on: '2026-11-15' }
    await as('admin', 'PATCH', `/admin/trackers/${first.id}`, { body: removed })
    expect((await addTracker(id, trackerBody('API-IMEI-2'))).status).toBe(201)
  })

  it('stops staff adding a tracker', async () => {
    const { id } = await addVehicle()
    const body = trackerBody()
    const { status } = await as('staff', 'POST', `/admin/vehicles/${id}/trackers`, { body })
    expect(status).toBe(403)
  })
})
