import { describe, expect, it } from 'vitest'
import { RESOURCES, buildBody, startingValue } from './admin-resources.js'

const form = (entries) => {
  const data = new FormData()
  Object.entries(entries).forEach(([name, value]) => data.append(name, value))
  return data
}

describe('what a form sends', () => {
  const { fields } = RESOURCES.rates

  it('turns numbers into numbers and leaves out blanks when adding', () => {
    const body = buildBody(
      fields,
      form({ class_id: 'c1', price_kes: '9500', usd_override: '', effective_from: '2026-12-01' }),
      false,
    )
    expect(body).toEqual({ class_id: 'c1', price_kes: 9500, effective_from: '2026-12-01' })
  })

  it('clears a field that may be cleared when it is blank on edit, and never sends a locked one', () => {
    const body = buildBody(
      fields,
      form({ class_id: 'c1', price_kes: '9500', effective_to: '', effective_from: '2026-12-01' }),
      true,
    )
    expect(body).toEqual({
      price_kes: 9500,
      usd_override: null,
      effective_from: '2026-12-01',
      effective_to: null,
    })
  })

  it('keeps text that is not a number as text, so the server can refuse it', () => {
    expect(buildBody(fields, form({ price_kes: 'lots' }), false).price_kes).toBe('lots')
  })

  it('sends a checkbox as true when ticked and false when not, and a list as an array', () => {
    const body = buildBody(
      RESOURCES.classes.fields,
      form({ name: 'SUV', seats: '7', best_for: 'safaris, families,' }),
      true,
    )
    expect(body).toMatchObject({ is_public: false, best_for: ['safaris', 'families'] })
  })
})

describe('the fleet forms', () => {
  it('leaves out status when a vehicle is added, and sends it when one is changed', () => {
    const fields = RESOURCES.vehicles.fields
    const data = form({ registration: 'KDA 001A', status: 'maintenance', owner_id: '' })
    expect(buildBody(fields, data, false)).toEqual({ registration: 'KDA 001A' })
    expect(buildBody(fields, data, true)).toEqual({
      registration: 'KDA 001A',
      status: 'maintenance',
      owner_id: null,
    })
  })

  it('keeps the vehicle an agreement is for, and never lets a tracker change its device', () => {
    const agreement = buildBody(
      RESOURCES.agreements.fields,
      form({ vehicle_id: 'v1', commission_percent: '20', starts_on: '2026-12-01' }),
      false,
    )
    expect(agreement).toEqual({ vehicle_id: 'v1', commission_percent: 20, starts_on: '2026-12-01' })
    const tracker = buildBody(
      RESOURCES.trackers.fields,
      form({ device_id: 'x', status: 'faulty' }),
      true,
    )
    expect(tracker).toEqual({ status: 'faulty' })
  })
})

describe('what a form starts with', () => {
  const { fields } = RESOURCES.classes
  const find = (name) => fields.find((field) => field.name === name)

  it('uses the record when editing, joining a list with commas', () => {
    expect(startingValue(find('best_for'), { best_for: ['a', 'b'] })).toBe('a, b')
    expect(startingValue(find('seats'), { seats: 5 })).toBe(5)
  })

  it('uses the field default when adding', () => {
    expect(startingValue(find('is_public'), null)).toBe(true)
    expect(startingValue(find('seats'), null)).toBe('')
  })
})
