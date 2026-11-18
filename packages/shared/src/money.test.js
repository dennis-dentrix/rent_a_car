import { describe, expect, it } from 'vitest'
import { assertKes, convertFromKes, formatMoney } from './money.js'

describe('money', () => {
  it('formats KES with a thousands separator', () => {
    expect(formatMoney(12500)).toBe('KES 12,500')
  })

  it('formats a converted USD amount without decimals', () => {
    expect(formatMoney(95, 'USD')).toBe('USD 95')
  })

  it('converts KES to USD at the stored rate and rounds for display', () => {
    expect(convertFromKes(12500, 129)).toBe(97)
  })

  it('rejects amounts that are not whole shillings', () => {
    expect(() => assertKes(12.5)).toThrow('whole number')
  })
})
