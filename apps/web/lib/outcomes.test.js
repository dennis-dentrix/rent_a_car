import { describe, expect, it } from 'vitest'
import { cancelledShare } from './outcomes.js'

describe('the cancellation rate', () => {
  it('is cancelled over confirmed, and nothing when none were confirmed', () => {
    expect(cancelledShare({ cancelled: 1, confirmed: 8 })).toBe(13)
    expect(cancelledShare({ cancelled: 0, confirmed: 0 })).toBe(0)
  })
})
