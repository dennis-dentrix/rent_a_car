import { describe, expect, it } from 'vitest'
import { classPriceRows, classRates } from './class-rates.js'

const classes = [
  { id: 'suv', price_per_day_kes: 18000 },
  { id: 'van', price_per_day_kes: null },
]
const rate = (extra) => ({
  class_id: 'suv',
  price_kes: 15000,
  effective_from: '2026-01-01',
  ...extra,
})

describe('what a car costs when it has no rate of its own', () => {
  it('is the company’s rate for the class while one is in force, otherwise Carvo’s', () => {
    expect(classRates(classes, [rate()], '2026-06-01').suv).toEqual({
      amountKes: 15000,
      isOwn: true,
    })
    const ended = rate({ effective_to: '2026-02-01' })
    expect(classRates(classes, [ended], '2026-06-01').suv).toEqual({
      amountKes: 18000,
      isOwn: false,
    })
  })

  it('says nothing for a class nobody has priced', () => {
    expect(classRates(classes, [], '2026-06-01').van).toBeUndefined()
  })
})

describe('the company\u2019s price list', () => {
  it('shows its own price in force beside what a renter pays', () => {
    const rows = classPriceRows(
      {
        classes: [{ id: 'suv' }, { id: 'van' }],
        ownRates: [
          { class_id: 'suv', price_kes: 9000, effective_from: '2026-01-01', effective_to: null },
          { class_id: 'van', price_kes: 5000, effective_from: '2027-01-01', effective_to: null },
        ],
        listed: [{ id: 'suv', price_per_day_kes: 12000 }],
      },
      '2026-06-01',
    )
    expect(rows.map((row) => [row.ownKes, row.renterKes])).toEqual([
      [9000, 12000],
      [null, null],
    ])
  })
})
