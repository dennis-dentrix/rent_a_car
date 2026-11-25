import { describe, expect, it } from 'vitest'
import { activeItem, navGroups } from './console-nav.js'

const items = [
  { href: '/console', label: 'Today', isExact: true, group: 'Run' },
  { href: '/console/bookings', label: 'Bookings', group: 'Run' },
  { href: '/console/fleet', label: 'Fleet', group: 'Fleet' },
]

describe('console navigation', () => {
  it('keeps the pages of a section together, in order', () => {
    expect(navGroups(items).map((group) => [group.name, group.items.length])).toEqual([
      ['Run', 2],
      ['Fleet', 1],
    ])
  })

  it('marks the page in view, including pages beneath it, and not the home page for all of them', () => {
    expect(activeItem(items, '/console/fleet/123').label).toBe('Fleet')
    expect(activeItem(items, '/console').label).toBe('Today')
    expect(activeItem(items, '/console/unknown')).toBeUndefined()
  })
})
