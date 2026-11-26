import { describe, expect, it } from 'vitest'
import { formatStayRange, hireDays, pickupTimeChange } from './stay-range.js'

describe('formatStayRange', () => {
  it('shows a range, a single day, or nothing', () => {
    expect(formatStayRange({ start: '2026-12-01', end: '2026-12-04' })).toBe(
      'Tue 1 Dec – Fri 4 Dec',
    )
    expect(formatStayRange({ start: '2026-12-01', end: '2026-12-01' })).toBe('Tue 1 Dec')
    expect(formatStayRange({ start: null, end: null })).toBe('')
  })
})

describe('how long a hire is', () => {
  const stay = { start: '2027-03-01', end: '2027-03-04', startTime: '09:00', endTime: '09:00' }

  it('counts 24-hour periods, so a later return adds a day', () => {
    expect(hireDays(stay)).toBe(3)
    expect(hireDays({ ...stay, endTime: '07:00' })).toBe(3)
    expect(hireDays({ ...stay, endTime: '18:00' })).toBe(4)
    expect(hireDays({ ...stay, end: null })).toBe(1)
  })

  it('moves the return time with the pickup time until it is set apart', () => {
    expect(pickupTimeChange(stay, '14:00')).toEqual({ startTime: '14:00', endTime: '14:00' })
    expect(pickupTimeChange({ ...stay, endTime: '18:00' }, '14:00')).toEqual({ startTime: '14:00' })
  })
})
