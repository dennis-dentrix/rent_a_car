import { describe, expect, it } from 'vitest'
import { isExpiring, readClaims, safeNext } from './token.js'

const tokenWith = (claims) =>
  `header.${Buffer.from(JSON.stringify(claims)).toString('base64url')}.signature`

describe('readClaims', () => {
  it('reads the end time and the assurance level', () => {
    expect(readClaims(tokenWith({ exp: 100, aal: 'aal2', sub: 'u1' }))).toEqual({
      exp: 100,
      aal: 'aal2',
      sub: 'u1',
    })
  })

  it('gives null for something that is not a token, or has no end time', () => {
    expect(readClaims('nonsense')).toBeNull()
    expect(readClaims(tokenWith({ aal: 'aal1' }))).toBeNull()
  })
})

describe('isExpiring', () => {
  const now = 1_000_000
  it('is true once the token ends within the margin, and when there is no token', () => {
    expect(isExpiring({ exp: now / 1000 + 30 }, now)).toBe(true)
    expect(isExpiring(null, now)).toBe(true)
  })

  it('is false while the token has time left', () => {
    expect(isExpiring({ exp: now / 1000 + 600 }, now)).toBe(false)
  })
})

describe('safeNext', () => {
  it('keeps a page on this site', () => {
    expect(safeNext('/admin/posts?page=2')).toBe('/admin/posts?page=2')
  })

  it.each([
    ['another site', 'https://evil.example/x'],
    ['a protocol-relative address', '//evil.example'],
    ['a sign-in page', '/auth/verify'],
    ['nothing', undefined],
  ])('falls back for %s', (_name, value) => {
    expect(safeNext(value, '/account')).toBe('/account')
  })
})
