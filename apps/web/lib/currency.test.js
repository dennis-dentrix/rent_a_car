import { describe, expect, it } from 'vitest'
import { currencyCookie, defaultCurrencyForCountry, readCurrencyCookie } from './currency.js'

describe('currency', () => {
  it('starts Kenya and unknown visitors on KES, everyone else on USD', () => {
    expect(defaultCurrencyForCountry('KE')).toBe('KES')
    expect(defaultCurrencyForCountry('ke')).toBe('KES')
    expect(defaultCurrencyForCountry(undefined)).toBe('KES')
    expect(defaultCurrencyForCountry('GB')).toBe('USD')
  })

  it('reads only a known currency from the cookie string', () => {
    expect(readCurrencyCookie('a=1; currency=USD; b=2')).toBe('USD')
    expect(readCurrencyCookie('currency=EUR')).toBeUndefined()
    expect(readCurrencyCookie('')).toBeUndefined()
  })

  it('writes a cookie that lasts a year and can be read back', () => {
    expect(readCurrencyCookie(currencyCookie('USD'))).toBe('USD')
    expect(currencyCookie('KES')).toContain('max-age=31536000')
  })
})
