import { copy } from '@/copy/en'
import { bookingsEntry } from '@/lib/bookings-entry'
import { topLinks } from '@/lib/nav'

const text = copy.menu
const entry = (href, label, icon) => ({ href, label, icon })

// What a signed-in person comes for most, as the two large tiles at the top.
function siteTiles(home) {
  const bookings = bookingsEntry(home)
  if (!bookings) return home ? [entry(home, copy.nav.dashboard, 'today')] : []
  return [
    { ...entry(bookings.href, bookings.label, 'bookings'), badge: bookings.badge },
    { ...entry(`${home}/messages`, copy.messages.title, 'messages'), badge: 'unread_messages' },
  ]
}

const ICONS = {
  '/car-hire': 'car',
  '/transfers': 'places',
  '/events': 'calendar',
  '/cars': 'fleet',
}

// The side list takes one flat list, each page naming its section.
const inGroup = (group, pages) => pages.map((page) => ({ ...page, group }))

/** The public site's menu: { tiles, items }. `home` is the signed-in person's area, or undefined for a visitor. */
export const siteMenu = (home) => ({
  tiles: siteTiles(home),
  items: [
    ...inGroup(
      text.hire,
      topLinks.map((link) => entry(link.href, link.label, ICONS[link.href])),
    ),
    ...inGroup(text.more, [
      entry('/blog', text.guides, 'guides'),
      entry('/operators', text.companies, 'companies'),
      ...(home ? [entry('/settings', text.settings, 'settings')] : []),
      entry('/privacy', text.privacy, 'policies'),
    ]),
  ],
})

/** A console's menu: the pages that count something as tiles, then every other page under its section's name. */
export const consoleMenu = (pages) => ({
  tiles: pages.filter((page) => page.badge),
  items: [
    ...pages.filter((page) => !page.badge),
    ...inGroup(text.more, [entry('/settings', text.settings, 'settings')]),
  ],
})
