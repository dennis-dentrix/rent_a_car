import { describe, expect, it } from 'vitest'
import { fromTomorrow, weekend } from './stay-presets.js'

describe('stay presets', () => {
  it('finds the coming Friday to Sunday from a weekday', () => {
    expect(weekend('2026-11-23')).toEqual({ start: '2026-11-27', end: '2026-11-29' }) // Monday
  })

  it('keeps the current weekend from Friday, Saturday, or Sunday, never starting in the past', () => {
    expect(weekend('2026-11-27')).toEqual({ start: '2026-11-27', end: '2026-11-29' }) // Friday
    expect(weekend('2026-11-28')).toEqual({ start: '2026-11-28', end: '2026-11-29' }) // Saturday
    expect(weekend('2026-11-29')).toEqual({ start: '2026-11-29', end: '2026-11-29' }) // Sunday
  })

  it('starts tomorrow and runs for the number of days', () => {
    expect(fromTomorrow('2026-11-30', 7)).toEqual({ start: '2026-12-01', end: '2026-12-07' })
  })
})
