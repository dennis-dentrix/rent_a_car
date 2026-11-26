import { describe, expect, it } from 'vitest'
import { newArrivals, titleWithCount } from './alerts.js'

const seen = (messages, requests) => ({
  unread_messages: messages,
  waiting_requests: requests,
  booking_updates: 0,
})

describe('what counts as news', () => {
  it('is only what went up since the last look', () => {
    expect(newArrivals(seen(1, 0), seen(2, 0))).toEqual(['unread_messages'])
    expect(newArrivals(seen(1, 1), seen(0, 1))).toEqual([])
  })

  it('is nothing on the first look', () => {
    expect(newArrivals(null, seen(3, 2))).toEqual([])
  })

  it('shows on the tab once, however often the title is set', () => {
    expect(titleWithCount('(2) Today | Carvo', 3)).toBe('(3) Today | Carvo')
    expect(titleWithCount('(3) Today | Carvo', 0)).toBe('Today | Carvo')
  })
})
