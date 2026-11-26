import { describe, expect, it } from 'vitest'
import { consoleMenu, siteMenu } from './mobile-menu.js'

const hrefs = (items) => items.map((item) => item.href)

describe('the phone menu of the site', () => {
  it('puts a renter’s bookings and messages at the top, with their counts', () => {
    expect(siteMenu('/account').tiles.map((tile) => tile.badge)).toEqual([
      'booking_updates',
      'unread_messages',
    ])
  })

  it('offers a visitor no account pages', () => {
    const menu = siteMenu(undefined)
    expect(menu.tiles).toEqual([])
    expect(hrefs(menu.items)).not.toContain('/settings')
  })

  it('sends a company to its own bookings', () => {
    expect(hrefs(siteMenu('/console').tiles)).toEqual(['/console/bookings', '/console/messages'])
  })
})

describe('the phone menu of a console', () => {
  it('shows counted pages as tiles and lists each other page once', () => {
    const menu = consoleMenu([
      { href: '/console', label: 'Today', group: 'Run' },
      { href: '/console/bookings', label: 'Bookings', group: 'Run', badge: 'waiting_requests' },
    ])
    expect(hrefs(menu.tiles)).toEqual(['/console/bookings'])
    expect(hrefs(menu.items)).toEqual(['/console', '/settings'])
  })
})
