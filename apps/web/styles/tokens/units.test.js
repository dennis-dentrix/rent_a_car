import { describe, expect, it } from 'vitest'
import { radius, screens, size, space, type } from './index.js'

// A size in pixels stays put when someone enlarges their text, so the words outgrow their boxes.
const PIXELS = /\d+px/

describe('size units', () => {
  it.each(Object.entries({ space, size, radius }))('scales %s with the text size', (_name, set) => {
    const fixed = Object.entries(set).filter(
      ([key, value]) => key !== 'pill' && PIXELS.test(value) && !value.startsWith('max('),
    )
    expect(fixed).toEqual([])
  })

  it('never lets a touch target fall under 44 px', () => {
    expect(size.touch).toBe('max(44px, 2.75rem)')
  })

  // So that large text gets the narrower layout, not a crowded wide one.
  it('changes layout by text size, not by pixels', () => {
    Object.values(screens).forEach((width) => expect(width).toMatch(/^[\d.]+em$/))
  })

  it('keeps type in rem', () => {
    Object.values(type).forEach(([fontSize]) => expect(fontSize).toMatch(/rem$/))
  })
})
