import { describe, expect, it } from 'vitest'
import { formatStayRange } from './stay-range.js'

describe('formatStayRange', () => {
  it('shows a range, a single day, or nothing', () => {
    expect(formatStayRange({ start: '2026-12-01', end: '2026-12-04' })).toBe(
      'Tue 1 Dec – Fri 4 Dec',
    )
    expect(formatStayRange({ start: '2026-12-01', end: '2026-12-01' })).toBe('Tue 1 Dec')
    expect(formatStayRange({ start: null, end: null })).toBe('')
  })
})
