import { describe, expect, it } from 'vitest'
import { checkCode, hashCode, newCode } from './inspection-code.js'

const now = new Date('2026-12-01T10:00:00Z')
const stored = (extra) => ({
  code_hash: hashCode('123456', 'report-1'),
  expires_at: '2026-12-01T10:05:00Z',
  attempts: 0,
  ...extra,
})
const check = (code, row = stored(), recordId = 'report-1') =>
  checkCode(row, { code, recordId, now })

describe('the code a renter signs with', () => {
  it('is six digits', () => {
    expect(newCode()).toMatch(/^\d{6}$/)
  })

  it('works once typed right, and only for the report it was sent for', () => {
    expect(check('123456')).toBe('ok')
    expect(check('123456', stored(), 'report-2')).toBe('wrong')
    expect(check('000000')).toBe('wrong')
  })

  it('stops working when it is old, used up, or was never sent', () => {
    expect(check('123456', stored({ expires_at: '2026-12-01T09:59:00Z' }))).toBe('expired')
    expect(check('123456', stored({ attempts: 5 }))).toBe('locked')
    expect(check('123456', null)).toBe('missing')
  })
})
