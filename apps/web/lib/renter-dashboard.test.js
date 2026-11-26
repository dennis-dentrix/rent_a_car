import { describe, expect, it } from 'vitest'
import { nextHire, renterLanding } from './renter-dashboard.js'

const hire = (id, status, startsOn) => ({ id, status, start_at: `${startsOn}T09:00:00Z` })

describe('the renter\u2019s next hire', () => {
  it('is the soonest one still to happen or under way', () => {
    const bookings = [
      hire(1, 'confirmed', '2026-12-09'),
      hire(2, 'cancelled', '2026-11-01'),
      hire(3, 'active', '2026-11-20'),
    ]
    expect(nextHire(bookings).id).toBe(3)
  })

  it('is nothing when every hire is over', () => {
    expect(nextHire([hire(1, 'closed', '2026-10-01')])).toBeNull()
  })
})

describe('where a renter lands with nothing else asked for', () => {
  it('is their next trip, or the cars when there is none', () => {
    expect(renterLanding([hire('b1', 'confirmed', '2026-12-09')])).toBe('/account/bookings/b1')
    expect(renterLanding([hire('b2', 'declined', '2026-12-09')])).toBe('/cars')
    expect(renterLanding([])).toBe('/cars')
  })
})
