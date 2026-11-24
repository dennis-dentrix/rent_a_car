import { copy } from '@/copy/en'

// Customer navigation: three tabs on phones (UX spec), text links in the top bar from tablet up.
export const customerTabs = [
  { href: '/cars', label: copy.nav.cars, icon: 'car' },
  { href: '/account/bookings', label: copy.nav.bookings, icon: 'bookings' },
  { href: '/account', label: copy.nav.account, icon: 'user' },
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
