import { afterEach, describe, expect, it } from 'vitest'
import { IDS, accounts, call, get, officeQuote, postQuote, withApi } from './api-client.js'

const db = withApi()

const admin = (method, path, body) => call(method, path, { body, token: accounts.admin })

let counter = 0
const classBody = (overrides = {}) => {
  counter += 1
  return { name: `API Class ${counter}`, slug: `api-class-${counter}`, seats: 5, ...overrides }
}
const addClass = async (overrides) =>
  (await admin('POST', '/admin/classes', classBody(overrides))).body.data
const addRate = (class_id, overrides = {}) =>
  admin('POST', '/admin/rates', {
    class_id,
    price_kes: 10000,
    effective_from: '2026-01-01',
    ...overrides,
  })

describe('only an admin enters business data', () => {
  it('turns away staff, customers, and guests', async () => {
    for (const token of [accounts.staff, accounts.customer]) {
      expect((await call('GET', '/admin/classes', { token })).status).toBe(403)
      expect((await call('POST', '/admin/rates', { token, body: {} })).status).toBe(403)
      expect(
        (await call('PUT', '/admin/settings/deposit_percent', { token, body: {} })).status,
      ).toBe(403)
    }
    expect((await call('GET', '/admin/classes')).status).toBe(401)
  })
})

describe('vehicle classes', () => {
  it('adds a class that guests then see, and hides it when switched off', async () => {
    const created = await addClass()
    const listed = async () => (await get('/classes')).body.data.map((item) => item.id)
    expect(await listed()).toContain(created.id)
    await admin('PATCH', `/admin/classes/${created.id}`, { is_public: false })
    expect(await listed()).not.toContain(created.id)
  })

  it('refuses a repeated slug, and a slug that is not lowercase with hyphens', async () => {
    const created = await addClass()
    expect((await admin('POST', '/admin/classes', classBody({ slug: created.slug }))).status).toBe(
      409,
    )
    expect((await admin('POST', '/admin/classes', classBody({ slug: 'Not A Slug' }))).status).toBe(
      400,
    )
  })

  it('sets a security deposit and clears it again with null', async () => {
    const { id } = await addClass()
    const set = await admin('PATCH', `/admin/classes/${id}`, {
      security_deposit_enabled: true,
      security_deposit_kes: 20000,
    })
    expect(set.body.data).toMatchObject({
      security_deposit_enabled: true,
      security_deposit_kes: 20000,
    })
    const cleared = await admin('PATCH', `/admin/classes/${id}`, { security_deposit_kes: null })
    expect(cleared.body.data.security_deposit_kes).toBeNull()
  })

  it('refuses an empty change and unknown fields', async () => {
    const { id } = await addClass()
    expect((await admin('PATCH', `/admin/classes/${id}`, {})).status).toBe(400)
    expect((await admin('PATCH', `/admin/classes/${id}`, { price: 1 })).status).toBe(400)
  })

  it('is not found for an id that does not exist', async () => {
    const missing = '00000000-0000-4000-8000-000000000999'
    expect((await admin('GET', `/admin/classes/${missing}`)).status).toBe(404)
  })
})

describe('rates', () => {
  it('prices a new class from its rate, end to end', async () => {
    const { id } = await addClass()
    await addRate(id, { price_kes: 12000 })
    await admin('POST', '/admin/vehicles', {
      registration: `API-RATE-${id.slice(0, 4)}`,
      chassis_number: `APICHASSISRATE${id.slice(0, 6)}`,
      class_id: id,
    })
    const quote = await postQuote(officeQuote({ class_id: id }))
    expect(quote.body.data.total_kes).toBe(36000)
  })

  it('refuses two rates that cover the same day, and a rate that ends before it starts', async () => {
    const { id } = await addClass()
    expect((await addRate(id)).status).toBe(201)
    expect((await addRate(id, { effective_from: '2026-06-01' })).status).toBe(409)
    expect(
      (await addRate(id, { effective_from: '2027-06-01', effective_to: '2027-05-01' })).status,
    ).toBe(400)
  })

  it('changes a price and keeps the class fixed', async () => {
    const { id } = await addClass()
    const rate = (await addRate(id)).body.data
    const changed = await admin('PATCH', `/admin/rates/${rate.id}`, { price_kes: 15000 })
    expect(changed.body.data.price_kes).toBe(15000)
    expect((await admin('PATCH', `/admin/rates/${rate.id}`, { class_id: id })).status).toBe(400)
  })

  it('refuses a price of zero or a fraction', async () => {
    const { id } = await addClass()
    expect((await addRate(id, { price_kes: 0 })).status).toBe(400)
    expect((await addRate(id, { price_kes: 99.5 })).status).toBe(400)
  })
})

describe('discounts, extras, zones, and locations', () => {
  it('adds a weekly discount and refuses a percent above 100', async () => {
    const body = {
      label: 'API Weekly',
      min_days: 7,
      kind: 'percent',
      value: 10,
      effective_from: '2026-01-01',
    }
    expect((await admin('POST', '/admin/discounts', body)).status).toBe(201)
    expect((await admin('POST', '/admin/discounts', { ...body, value: 150 })).status).toBe(400)
  })

  it('adds an extra and switches it off', async () => {
    const created = await admin('POST', '/admin/extras', {
      name: 'API Child seat',
      price_kes: 500,
      pricing_type: 'per_day',
    })
    expect(created.status).toBe(201)
    const off = await admin('PATCH', `/admin/extras/${created.body.data.id}`, { is_active: false })
    expect(off.body.data.is_active).toBe(false)
  })
})

describe('delivery zones and locations', () => {
  it('adds a delivery zone and a location, and refuses a repeated location slug', async () => {
    expect(
      (await admin('POST', '/admin/delivery-zones', { name: 'API Zone', fee_kes: 1500 })).status,
    ).toBe(201)
    const location = {
      name: 'API Depot',
      type: 'office',
      address: 'Mombasa Road',
      slug: 'api-depot',
    }
    expect((await admin('POST', '/admin/locations', location)).status).toBe(201)
    expect((await admin('POST', '/admin/locations', location)).status).toBe(409)
  })

  it('lists with a cursor', async () => {
    await admin('POST', '/admin/delivery-zones', { name: 'API Zone A', fee_kes: 100 })
    await admin('POST', '/admin/delivery-zones', { name: 'API Zone B', fee_kes: 200 })
    const first = await admin('GET', '/admin/delivery-zones?limit=1')
    expect(first.body.data).toHaveLength(1)
    const next = await admin(
      'GET',
      `/admin/delivery-zones?limit=1&cursor=${first.body.meta.next_cursor}`,
    )
    expect(next.body.data[0].id).not.toBe(first.body.data[0].id)
  })
})

describe('settings', () => {
  afterEach(() => db.query("update settings set value = '30' where key = 'deposit_percent'"))

  it('lists the settings an admin can change', async () => {
    const { body } = await admin('GET', '/admin/settings')
    expect(body.data.find((row) => row.key === 'deposit_percent').value).toBe(30)
  })

  it('changes a setting that the next quote then uses', async () => {
    const put = await admin('PUT', '/admin/settings/deposit_percent', { value: 50 })
    expect(put.body.data.value).toBe(50)
    const quote = await postQuote(officeQuote({ class_id: IDS.SEDAN }))
    expect(quote.body.data.deposit_kes * 2).toBe(quote.body.data.total_kes)
  })
})

describe('settings that are refused', () => {
  it.each([
    ['a percent above 100', 'deposit_percent', 150],
    ['text where a number goes', 'hold_minutes', 'soon'],
    ['a number where on or off goes', 'etims_enabled', 1],
    ['a fraction', 'minimum_age', 20.5],
  ])('refuses %s', async (_name, key, value) => {
    expect((await admin('PUT', `/admin/settings/${key}`, { value })).status).toBe(400)
  })

  it('is not found for a setting that does not exist', async () => {
    expect((await admin('PUT', '/admin/settings/made_up', { value: 1 })).status).toBe(404)
  })
})

describe('changes to settings are audited', () => {
  afterEach(() => db.query("update settings set value = '30' where key = 'deposit_percent'"))

  it('records who changed it in the audit log', async () => {
    await admin('PUT', '/admin/settings/deposit_percent', { value: 40 })
    const { rows } = await db.query(
      `select p.role from audit_log a join profiles p on p.id = a.actor_id
       where a.table_name = 'settings' and a.action = 'UPDATE'`,
    )
    expect(rows.map((row) => row.role)).toEqual(['admin'])
  })
})

describe('the USD rate', () => {
  afterEach(() =>
    db.query(
      "update exchange_rates set rate_to_kes = 129, rate_date = '2026-11-15' where currency = 'USD'",
    ),
  )

  it('sets the rate for USD and lists it', async () => {
    const put = await admin('PUT', '/admin/exchange-rates/USD', {
      rate_to_kes: 131.5,
      rate_date: '2026-11-15',
    })
    expect(put.status).toBe(200)
    const listed = await admin('GET', '/admin/exchange-rates')
    expect(listed.body.data.find((row) => row.currency === 'USD').rate_to_kes).toBe(131.5)
  })

  it('refuses other currencies and a rate that is not positive', async () => {
    const body = { rate_to_kes: 150, rate_date: '2026-11-15' }
    expect((await admin('PUT', '/admin/exchange-rates/EUR', body)).status).toBe(404)
    expect(
      (await admin('PUT', '/admin/exchange-rates/USD', { ...body, rate_to_kes: 0 })).status,
    ).toBe(400)
  })
})
