import { describe, expect, it } from 'vitest'
import { addDays, countDays, isBlocked, monthGrid, pickDay, pickSingleDay } from './calendar.js'

describe('calendar', () => {
  it('lays a month out Monday first with null padding', () => {
    const weeks = monthGrid(2026, 10) // November 2026 starts on a Sunday
    expect(weeks[0]).toEqual([null, null, null, null, null, null, '2026-11-01'])
    expect(weeks.at(-1).at(-1)).toBe(null)
    expect(weeks.flat().filter(Boolean)).toHaveLength(30)
  })

  it('counts days inclusively and adds days across a month end', () => {
    expect(countDays('2026-11-10', '2026-11-10')).toBe(1)
    expect(countDays('2026-11-10', '2026-11-12')).toBe(3)
    expect(addDays('2026-11-30', 1)).toBe('2026-12-01')
  })

  it('treats both ends of a blocked range as blocked', () => {
    const blocked = [['2026-11-12', '2026-11-14']]
    expect([11, 12, 14, 15].map((d) => isBlocked(`2026-11-${d}`, blocked))).toEqual([
      false,
      true,
      true,
      false,
    ])
  })

  it('sets start then end, and restarts on an earlier day', () => {
    const first = pickDay({ start: null, end: null }, '2026-11-10')
    expect(first).toEqual({ start: '2026-11-10', end: null })
    expect(pickDay(first, '2026-11-12')).toEqual({ start: '2026-11-10', end: '2026-11-12' })
    expect(pickDay(first, '2026-11-08')).toEqual({ start: '2026-11-08', end: null })
  })

  it('restarts instead of ending a range across a blocked day', () => {
    const blocked = [['2026-11-11', '2026-11-11']]
    const range = pickDay({ start: '2026-11-10', end: null }, '2026-11-12', blocked)
    expect(range).toEqual({ start: '2026-11-12', end: null })
  })

  it('turns one tapped day into a one-day range', () => {
    expect(pickSingleDay('2026-12-05')).toEqual({ start: '2026-12-05', end: '2026-12-05' })
  })
})
