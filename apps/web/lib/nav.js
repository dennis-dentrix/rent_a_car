import { copy } from '@/copy/en'

/**
 * The last tab on a phone: "Sign in" for a visitor, "Trips" for a renter, and the dashboard for a company or admin.
 * `who` is null until the server has answered; `hasHint` says someone seems to be signed in meanwhile.
 */
export function accountTab(who, hasHint) {
  if (who?.home === '/account') {
    return {
      href: '/account/bookings',
      label: copy.nav.bookings,
      icon: 'bookings',
      badge: 'booking_updates',
    }
  }
  if (who) return { href: who.home, label: copy.nav.dashboard, icon: 'today' }
  if (hasHint) return { href: '/account', label: copy.nav.account, icon: 'user' }
  return { href: '/auth', label: copy.nav.signIn, icon: 'signIn' }
}

const MESSAGES_TAB = {
  href: '/account/messages',
  label: copy.messages.title,
  icon: 'messages',
  badge: 'unread_messages',
}

// Customer navigation on phones. Only pages that exist.
export const customerTabs = (who, hasHint) => [
  { href: '/', label: copy.nav.home, icon: 'home', isExact: true },
  { href: '/cars', label: copy.nav.cars, icon: 'car' },
  ...(who?.home === '/account' ? [MESSAGES_TAB] : []),
  accountTab(who, hasHint),
]

// Only pages that exist: the three service pages and the full list of cars.
export const topLinks = [
  { href: '/car-hire', label: copy.nav.carHire },
  { href: '/transfers', label: copy.nav.transfers },
  { href: '/events', label: copy.nav.events },
  { href: '/cars', label: copy.nav.allCars },
]

// Operator console: four tabs on phones, a side rail from tablet up. Admin gets its own list when built.
export const consoleTabs = [
  { href: '/console', label: copy.console.dashboard, icon: 'today' },
  { href: '/console/bookings', label: copy.console.bookings, icon: 'requests' },
  { href: '/console/fleet', label: copy.console.fleet, icon: 'fleet' },
  { href: '/console/help', label: copy.nav.help, icon: 'help' },
]
