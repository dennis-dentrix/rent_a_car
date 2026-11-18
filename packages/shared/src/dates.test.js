import { describe, expect, it } from 'vitest'
import { formatShortDate, formatTime, nairobiDayRange, toUtcIso } from './dates.js'

describe('dates', () => {
  it('shows Nairobi time for a UTC instant', () => {
    expect(formatTime('2026-11-10T06:00:00Z')).toBe('09:00')
  })

  it('shows the short date in Nairobi, not UTC', () => {
    expect(formatShortDate('2026-11-09T22:30:00Z')).toBe('Tue 10 Nov')
  })

  it('stores an offset time as UTC', () => {
    expect(toUtcIso('2026-11-10T06:00:00+03:00')).toBe('2026-11-10T03:00:00.000Z')
  })

  it('gives the UTC range of a Nairobi day', () => {
    expect(nairobiDayRange('2026-11-10')).toEqual([
      '2026-11-09T21:00:00.000Z',
      '2026-11-10T21:00:00.000Z',
    ])
  })
})
