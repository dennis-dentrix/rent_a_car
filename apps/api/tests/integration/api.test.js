import { beforeAll, describe, expect, it } from 'vitest'
import {
  DATES,
  IDS,
  deliveryHandover,
  get,
  loadApp,
  officeQuote,
  postQuote,
  query,
} from './api-client.js'

const { START, END_3_DAYS, END_7_DAYS } = DATES

beforeAll(loadApp)

describe('GET /classes', () => {
  it('lists public classes with the current daily rate', async () => {
    const { status, body } = await get('/classes')
    expect(status).toBe(200)
    expect(body.data.map((item) => item.price_per_day_kes)).toEqual([12500, 18000, 25000])
  })

  it('converts prices for display when USD is chosen', async () => {
    const { body } = await get(`/classes${query({ currency: 'USD' })}`)
    expect(body.data[0]).toMatchObject({
      price_per_day_kes: 12500,
      price_per_day_display: 97,
      display_currency: 'USD',
    })
  })

  it('counts available vehicles for the dates', async () => {
    const { body } = await get(`/classes${query({ from: START, to: END_3_DAYS })}`)
    expect(body.data[0].available_count).toBe(2)
  })

  it('rejects a single date', async () => {
    const { body } = await get(`/classes${query({ from: START })}`)
    expect(body.error.code).toBe('VALIDATION_FAILED')
  })
})

describe('GET /classes/{id}, /locations, /availability', () => {
  it('returns one class', async () => {
    const { body } = await get(`/classes/${IDS.SEDAN}`)
    expect(body.data.name).toBe('Executive Sedan')
  })

  it('returns not found for an unknown class', async () => {
    const path = `/classes/${IDS.UNKNOWN}`
    const { status } = await get(path)
    expect(status).toBe(404)
  })

  it('lists served locations', async () => {
    const { body } = await get('/locations')
    const slugs = body.data.map((location) => location.slug).sort()
    expect(slugs).toEqual(['jkia-airport', 'nairobi', 'nairobi-office'])
  })

  it('reports availability for a class', async () => {
    const params = { class_id: IDS.SEDAN, start_at: START, end_at: END_3_DAYS }
    const { body } = await get(`/availability${query(params)}`)
    expect(body.data).toEqual({ available: true, available_count: 2 })
  })
})

describe('POST /quotes pricing', () => {
  it('prices an office pickup from the rate table', async () => {
    const { status, body } = await postQuote(officeQuote())
    expect(status).toBe(201)
    expect(body.data).toMatchObject({
      total_kes: 37500,
      deposit_kes: 11250,
      balance_kes: 26250,
      availability: true,
    })
  })

  it("matches the pack's worked example with a driver and delivery", async () => {
    const { body } = await postQuote(
      officeQuote({ extras: [IDS.CHAUFFEUR], handover: deliveryHandover }),
    )
    expect(body.data).toMatchObject({ total_kes: 45000, deposit_kes: 13500 })
    expect(body.data.breakdown.map((line) => line.label)).toContain('Refundable deposit')
  })

  it('applies the weekly discount and fixes the USD display amount', async () => {
    const { body } = await postQuote(officeQuote({ end_at: END_7_DAYS, currency: 'USD' }))
    expect(body.data.total_kes).toBe(78750)
    expect(body.data.display).toMatchObject({ currency: 'USD', total: 610, rate_to_kes: 129 })
  })
})

describe('POST /quotes minimum hire', () => {
  const sameDay = { end_at: '2027-03-01T18:00:00+03:00' }

  it('charges a rental shorter than two days as two days', async () => {
    const { body } = await postQuote(officeQuote(sameDay))
    expect(body.data.total_kes).toBe(25000)
    expect(body.data.breakdown[0].label).toBe('Vehicle, 2 day(s)')
  })

  it('lets an airport transfer be charged as a single day', async () => {
    const { body } = await postQuote(officeQuote({ ...sameDay, service: 'airport_transfer' }))
    expect(body.data.total_kes).toBe(12500)
  })
})

describe('POST /quotes errors', () => {
  it.each([
    ['a start time in the past', officeQuote({ start_at: '2020-01-01T08:00:00+03:00' })],
    ['an unknown field', { ...officeQuote(), total_kes: 1 }],
    ['delivery without a zone', officeQuote({ handover: { type: 'delivery' } })],
    ['an end before the start', officeQuote({ end_at: '2027-02-28T08:00:00+03:00' })],
  ])('rejects %s', async (_name, request) => {
    const { status, body } = await postQuote(request)
    expect(status).toBe(400)
    expect(body.error.code).toBe('VALIDATION_FAILED')
  })

  it('returns not found for an unknown class', async () => {
    const { status } = await postQuote(officeQuote({ class_id: IDS.UNKNOWN }))
    expect(status).toBe(404)
  })
})
