import { describe, expect, it } from 'vitest'
import { canCancel, nextStep, paymentTotals } from './hire.js'

describe('what a company can do with a booking', () => {
  it('has one next step until the hire is closed', () => {
    expect(['confirmed', 'ready', 'active', 'returned', 'closed'].map(nextStep)).toEqual([
      'ready',
      'active',
      'returned',
      'closed',
      null,
    ])
  })

  it('can cancel only before the car leaves', () => {
    expect(canCancel('ready')).toBe(true)
    expect(canCancel('active')).toBe(false)
  })

  it('counts only money that arrived', () => {
    const payments = [
      { status: 'succeeded', amount_kes: 4000 },
      { status: 'failed', amount_kes: 9000 },
    ]
    expect(paymentTotals({ total_kes: 10000, payments })).toEqual({ paid: 4000, owed: 6000 })
  })
})
