import { copy } from '@/copy/en'

const ENTRIES = {
  '/account': {
    href: '/account/bookings',
    label: copy.journey.renter.listTitle,
    badge: 'booking_updates',
  },
  '/console': {
    href: '/console/bookings',
    label: copy.operatorConsole.nav.bookings,
    badge: 'waiting_requests',
  },
}

/** Where a person's bookings are and which count belongs to them, by their home page. The admin has none. */
export const bookingsEntry = (home) => ENTRIES[home]
