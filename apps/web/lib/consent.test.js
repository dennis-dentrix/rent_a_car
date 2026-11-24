import { describe, expect, it } from 'vitest'
import { clearedConsentCookie, consentCookie, readConsentCookie } from './consent.js'

describe('analytics consent', () => {
  it('reads only a known choice from the cookie string', () => {
    expect(readConsentCookie('a=1; analytics_consent=granted; b=2')).toBe('granted')
    expect(readConsentCookie('analytics_consent=denied')).toBe('denied')
    expect(readConsentCookie('analytics_consent=maybe')).toBeUndefined()
    expect(readConsentCookie('')).toBeUndefined()
  })

  it('writes a cookie that lasts six months and can be read back', () => {
    expect(readConsentCookie(consentCookie('granted'))).toBe('granted')
    expect(consentCookie('denied')).toContain('max-age=15724800')
  })

  it('forgets the choice with a cookie that has already expired', () => {
    expect(clearedConsentCookie()).toContain('max-age=0')
    expect(readConsentCookie(clearedConsentCookie())).toBeUndefined()
  })
})
