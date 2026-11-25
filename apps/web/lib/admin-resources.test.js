import { describe, expect, it } from 'vitest'
import { RESOURCES, buildBody, startingValue } from './admin-resources.js'
import { formDataFrom } from './form-data.js'

describe('what a form sends', () => {
  const { fields } = RESOURCES.rates

  it('turns numbers into numbers and leaves out blanks when adding', () => {
    const body = buildBody(
      fields,
      formDataFrom({
        class_id: 'c1',
        price_kes: '9500',
        usd_override: '',
        effective_from: '2026-12-01',
      }),
      false,
    )
    expect(body).toEqual({ class_id: 'c1', price_kes: 9500, effective_from: '2026-12-01' })
  })

  it('clears a field that may be cleared when it is blank on edit, and never sends a locked one', () => {
    const body = buildBody(
      fields,
      formDataFrom({
        class_id: 'c1',
        price_kes: '9500',
        effective_to: '',
        effective_from: '2026-12-01',
      }),
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
    expect(buildBody(fields, formDataFrom({ price_kes: 'lots' }), false).price_kes).toBe('lots')
  })
})

describe('what a form sends for ticks and lists', () => {
  it('sends a checkbox as true when ticked and false when not, and a list as an array', () => {
    const body = buildBody(
      RESOURCES.classes.fields,
      formDataFrom({ name: 'SUV', seats: '7', best_for: 'safaris, families,' }),
      true,
    )
    expect(body).toMatchObject({ is_public: false, best_for: ['safaris', 'families'] })
  })
})

describe('the fleet forms', () => {
  it('leaves out status when a vehicle is added, and sends it when one is changed', () => {
    const fields = RESOURCES.vehicles.fields
    const data = formDataFrom({ registration: 'KDA 001A', status: 'maintenance', owner_id: '' })
    expect(buildBody(fields, data, false)).toEqual({ registration: 'KDA 001A' })
    expect(buildBody(fields, data, true)).toMatchObject({
      registration: 'KDA 001A',
      status: 'maintenance',
      owner_id: null,
      daily_rate_kes: null,
    })
  })

  it('keeps the vehicle an agreement is for, and never lets a tracker change its device', () => {
    const agreement = buildBody(
      RESOURCES.agreements.fields,
      formDataFrom({ vehicle_id: 'v1', commission_percent: '20', starts_on: '2026-12-01' }),
      false,
    )
    expect(agreement).toEqual({ vehicle_id: 'v1', commission_percent: 20, starts_on: '2026-12-01' })
    const tracker = buildBody(
      RESOURCES.trackers.fields,
      formDataFrom({ device_id: 'x', status: 'faulty' }),
      true,
    )
    expect(tracker).toEqual({ status: 'faulty' })
  })
})

describe('a list written one per line', () => {
  const fields = [{ name: 'rules', type: 'lines' }]

  it('sends one entry per line, clears on edit when emptied, and shows them on lines again', () => {
    expect(
      buildBody(fields, formDataFrom({ rules: 'No smoking\n\n Return clean ' }), false),
    ).toEqual({
      rules: ['No smoking', 'Return clean'],
    })
    expect(buildBody(fields, formDataFrom({ rules: '' }), false)).toEqual({})
    expect(buildBody(fields, formDataFrom({ rules: '' }), true)).toEqual({ rules: [] })
    expect(startingValue(fields[0], { rules: ['a', 'b'] })).toBe('a\nb')
  })
})

describe('a field that only a new record takes', () => {
  const fields = [{ name: 'price_kes', type: 'number', isCreateOnly: true }]
  const filled = formDataFrom({ price_kes: '4000' })

  it('is sent when adding and never when editing', () => {
    expect(buildBody(fields, filled, false)).toEqual({ price_kes: 4000 })
    expect(buildBody(fields, filled, true)).toEqual({})
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
