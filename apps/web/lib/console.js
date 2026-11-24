import { copy } from '@/copy/en'
import { apiGet } from '@/lib/api'
import { requireRole } from '@/lib/auth/session'

const text = copy.operatorConsole.nav

// The company's navigation: a labelled side rail from tablet up, and on phones four tabs, the last opening the list.
export const consoleRail = [
  { href: '/console', label: text.today, icon: 'today', isExact: true, group: text.groupRun },
  { href: '/console/bookings', label: text.bookings, icon: 'requests', group: text.groupRun },
  { href: '/console/fleet', label: text.fleet, icon: 'fleet', group: text.groupFleet },
  { href: '/console/owners', label: text.owners, icon: 'team', group: text.groupFleet },
  { href: '/console/classes', label: text.classes, icon: 'prices', group: text.groupPricing },
  { href: '/console/rates', label: text.rates, icon: 'prices', group: text.groupPricing },
  { href: '/console/places', label: text.places, icon: 'places', group: text.groupSetup },
  { href: '/console/services', label: text.services, icon: 'guides', group: text.groupSetup },
  { href: '/console/company', label: text.company, icon: 'companies', group: text.groupSetup },
]

export const consoleTabs = [
  { href: '/console', label: text.today, icon: 'today', isExact: true },
  { href: '/console/bookings', label: text.bookings, icon: 'requests' },
  { href: '/console/fleet', label: text.fleet, icon: 'fleet' },
  { href: '/console/menu', label: text.more, icon: 'more' },
]

/** The signed-in person of a rental company. A page asks too, because it is drawn alongside its layout. */
export const requireOperator = () => requireRole(['operator'], '/console')

/** One call to the API as the signed-in operator. */
export const consoleGet = (path, token, query) => apiGet(path, { token, query })

/** Class names by id for the lists that carry only the id: Carvo's classes and the company's own. */
export async function getOperatorClassNames(token) {
  const { data } = await consoleGet('/operator/classes', token, { limit: 100 })
  return new Map((data ?? []).map((item) => [item.id, item.name]))
}
