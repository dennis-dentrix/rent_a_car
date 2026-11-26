import { describe, expect, it } from 'vitest'
import {
  formatShortDate,
  formatTime,
  nairobiDayBounds,
  nairobiDayRange,
  toUtcIso,
} from './dates.js'

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

  it('uses the times the customer picked instead of the working day', () => {
    expect(
      nairobiDayBounds('2026-11-10', '2026-11-12', { startTime: '09:30', endTime: '14:00' }),
    ).toEqual({ from: '2026-11-10T09:30:00+03:00', to: '2026-11-12T14:00:00+03:00' })
  })

  // A later return would start another 24-hour period and charge a day more than the dates suggest.
  it('returns at the pickup time unless another return time is picked', () => {
    expect(nairobiDayBounds('2026-11-10', '2026-11-12')).toEqual({
      from: '2026-11-10T08:00:00+03:00',
      to: '2026-11-12T08:00:00+03:00',
    })
    expect(nairobiDayBounds('2026-11-10', '2026-11-12', { startTime: '15:00' }).to).toBe(
      '2026-11-12T15:00:00+03:00',
    )
  })
})
