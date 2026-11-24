import { describe, expect, it } from 'vitest'
import { BODY_STYLES, bodyStyleFor } from './vehicle-art.js'

describe('bodyStyleFor', () => {
  it('maps car-type names to a drawing', () => {
    expect(bodyStyleFor('Family SUV')).toBe('suv')
    expect(bodyStyleFor('14-seater Van')).toBe('van')
    expect(bodyStyleFor('Tour van')).toBe('tour')
    expect(bodyStyleFor('Luxury')).toBe('sedan')
    expect(bodyStyleFor('Hatchback')).toBe('hatch')
    expect(bodyStyleFor('Safari Cruiser')).toBe('tour')
    expect(bodyStyleFor('Premium')).toBe('sedan')
    expect(bodyStyleFor('Double cab pickup')).toBe('pickup')
  })

  it('falls back to a hatchback, and every result has a drawing', () => {
    expect(bodyStyleFor('Economy')).toBe('hatch')
    expect(Object.keys(BODY_STYLES)).toEqual(['hatch', 'sedan', 'suv', 'van', 'tour', 'pickup'])
  })
})
