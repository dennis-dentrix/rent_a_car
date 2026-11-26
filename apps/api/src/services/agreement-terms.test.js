import { describe, expect, it } from 'vitest'
import { buildTerms } from './agreement-terms.js'

const facts = (booking = {}) => ({
  lessor: 'Savannah Rentals',
  booking: {
    total_kes: 54000,
    deposit_kes: 0,
    security_deposit_kes: 0,
    balance_kes: 54000,
    ...booking,
  },
  rules: { grace_minutes: 60, cancellation_window_hours: 24, minimum_age: 21 },
})
const textOf = (terms) => terms.clauses.map((clause) => `${clause.title} ${clause.text}`).join(' ')

describe('the parties to the agreement', () => {
  it('names the rental company that lets the car', () => {
    const [first] = buildTerms(facts()).clauses
    expect(first.text).toContain('between Savannah Rentals (the Company)')
  })
})

describe('money in the agreement', () => {
  it('says nothing about a deposit or cancellation money when no deposit is taken', () => {
    const terms = buildTerms(facts())
    expect(textOf(terms)).not.toMatch(/deposit/i)
    expect(textOf(terms)).toContain('KES 54,000')
    expect(terms.clauses.map((clause) => clause.number)).toEqual(
      terms.clauses.map((_, index) => index + 1),
    )
  })

  it('keeps the deposit and cancellation terms of a booking made with a deposit', () => {
    const text = textOf(buildTerms(facts({ deposit_kes: 16200, balance_kes: 37800 })))
    expect(text).toContain('refundable deposit of KES 16,200')
    expect(text).toContain('Cancelling')
  })
})
