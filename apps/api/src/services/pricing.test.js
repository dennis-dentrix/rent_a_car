import { describe, expect, it } from 'vitest'
import {
  calculateDepositKes,
  calculateQuote,
  calculateStay,
  chauffeurDailyKes,
  discountsForCar,
  minimumHireDays,
  rentalDays,
  vatIncludedKes,
} from './pricing.js'

const START = '2026-11-20T08:00:00+03:00'

describe('discountsForCar', () => {
  it('lets no platform discount lower a price a company set', () => {
    const weekly = { id: 'w', class_id: null, min_days: 7, kind: 'percent', value: 10 }
    expect(discountsForCar([weekly])).toEqual([])
  })
})

describe('chauffeurDailyKes', () => {
  const car = (option, kes = 3000) => ({ chauffeur_option: option, chauffeur_daily_kes: kes })

  it('adds nothing to a self-drive hire', () => {
    expect(chauffeurDailyKes(car('both'), false)).toBe(0)
    expect(chauffeurDailyKes(car(null, null), false)).toBe(0)
  })

  it('adds the daily price when asked for, or when the car only comes with a driver', () => {
    expect(chauffeurDailyKes(car('both'), true)).toBe(3000)
    expect(chauffeurDailyKes(car('chauffeur'), false)).toBe(3000)
  })

  it('cannot be priced when the car offers no chauffeur or no price for one', () => {
    expect(chauffeurDailyKes(car('self_drive'), true)).toBeNull()
    expect(chauffeurDailyKes(car('both', null), true)).toBeNull()
  })
})

describe('calculateStay', () => {
  const stay = { startAt: START, endAt: '2026-11-23T08:00:00+03:00', minimumDays: 2 }
  const car = { daily_rate_kes: 4000, chauffeur_option: 'both', chauffeur_daily_kes: 3000 }

  it('totals the car and any chauffeur for each day', () => {
    expect(calculateStay(car, stay)).toEqual({ days: 3, total_kes: 12000 })
    expect(calculateStay(car, { ...stay, withChauffeur: true })).toEqual({
      days: 3,
      total_kes: 21000,
    })
  })
})

describe('rentalDays', () => {
  it('counts whole 24-hour periods', () => {
    expect(rentalDays(START, '2026-11-23T08:00:00+03:00')).toBe(3)
  })

  it('rounds a part day up', () => {
    expect(rentalDays(START, '2026-11-23T18:00:00+03:00')).toBe(4)
  })

  it('charges at least one day by default', () => {
    expect(rentalDays(START, '2026-11-20T12:00:00+03:00')).toBe(1)
  })

  it('charges the minimum days when the stay is shorter', () => {
    expect(rentalDays(START, '2026-11-20T12:00:00+03:00', 2)).toBe(2)
  })

  it('does not shorten a stay that is longer than the minimum', () => {
    expect(rentalDays(START, '2026-11-23T08:00:00+03:00', 2)).toBe(3)
  })
})

describe('minimumHireDays', () => {
  it('requires the configured minimum for a rental', () => {
    expect(minimumHireDays('rental', 2)).toBe(2)
  })

  it('lets an airport transfer be a single day', () => {
    expect(minimumHireDays('airport_transfer', 2)).toBe(1)
  })
})

describe('calculateDepositKes', () => {
  it('returns deposit as 30 percent rounded down', () => {
    expect(calculateDepositKes(45001, 30)).toBe(13500)
  })
})

describe('vatIncludedKes', () => {
  it('extracts the VAT already inside a 16 percent inclusive total', () => {
    expect(vatIncludedKes(11600, 16)).toBe(1600)
  })
})

// The worked example in the pack: 3 days, a driver, and delivery.
const worked = {
  dailyRateKes: 12500,
  days: 3,
  extras: [{ name: 'Driver', priceKes: 2000, pricingType: 'per_day' }],
  deliveryFeeKes: 1500,
  depositPercent: 30,
}

const lineOfKind = (quote, kind) => quote.lines.find((line) => line.kind === kind)

describe('calculateQuote', () => {
  it('matches the worked example in the pack: KES 45,000 total and KES 13,500 deposit', () => {
    const quote = calculateQuote(worked)
    expect(quote.totalKes).toBe(45000)
    expect(quote.depositKes).toBe(13500)
    expect(quote.balanceKes).toBe(31500)
  })

  it('keeps the security deposit out of the total', () => {
    const quote = calculateQuote({ ...worked, securityDepositKes: 20000 })
    expect(quote.totalKes).toBe(45000)
    expect(lineOfKind(quote, 'security_deposit').amountKes).toBe(20000)
  })

  it('labels the deposit as refundable', () => {
    expect(lineOfKind(calculateQuote(worked), 'refundable_deposit').label).toBe(
      'Refundable deposit',
    )
  })

  it('takes no deposit when the deposit percent is 0: no deposit line, and the whole total is the balance', () => {
    const quote = calculateQuote({ ...worked, depositPercent: 0 })
    expect(quote.depositKes).toBe(0)
    expect(quote.balanceKes).toBe(45000)
    expect(lineOfKind(quote, 'refundable_deposit')).toBeUndefined()
  })

  it('shows the VAT already included in the total, without adding to it', () => {
    const quote = calculateQuote({ ...worked, vatPercent: 16 })
    expect(lineOfKind(quote, 'tax').amountKes).toBe(6207)
    expect(quote.totalKes).toBe(45000)
  })
})

describe('calculateQuote discounts', () => {
  const weekly = { id: 'w', label: 'Weekly 10%', min_days: 7, kind: 'percent', value: 10 }
  const fixed = { id: 'f', label: 'KES 5,000 off', min_days: 7, kind: 'fixed', value: 5000 }
  const sevenDays = { ...worked, days: 7 }

  it('applies the best qualifying discount to the vehicle charge only', () => {
    const quote = calculateQuote({ ...sevenDays, discounts: [weekly, fixed] })
    // Vehicle 87,500; 10% is 8,750 and beats the fixed 5,000.
    expect(lineOfKind(quote, 'discount')).toEqual({
      kind: 'discount',
      label: 'Weekly 10%',
      amountKes: -8750,
    })
    // 87,500 - 8,750 + driver 14,000 + delivery 1,500
    expect(quote.totalKes).toBe(94250)
  })

  it('chooses a fixed discount when it saves more than the percentage', () => {
    const big = { ...fixed, value: 20000 }
    const quote = calculateQuote({ ...sevenDays, discounts: [weekly, big] })
    expect(lineOfKind(quote, 'discount').amountKes).toBe(-20000)
  })

  it('ignores a discount whose minimum days are not reached', () => {
    const quote = calculateQuote({ ...worked, discounts: [weekly] })
    expect(lineOfKind(quote, 'discount')).toBeUndefined()
    expect(quote.totalKes).toBe(45000)
  })

  it('never takes the vehicle charge below zero', () => {
    const huge = { ...fixed, min_days: 1, value: 999999 }
    const quote = calculateQuote({ ...worked, discounts: [huge] })
    expect(quote.totalKes).toBe(6000 + 1500)
  })

  it('leaves delivery fees and the security deposit out of the discount', () => {
    const quote = calculateQuote({ ...sevenDays, discounts: [weekly], securityDepositKes: 20000 })
    expect(lineOfKind(quote, 'security_deposit').amountKes).toBe(20000)
    expect(quote.lines.find((line) => line.label === 'Delivery').amountKes).toBe(1500)
  })
})
