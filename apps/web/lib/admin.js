import { notFound } from 'next/navigation'
import { copy } from '@/copy/en'
import { apiGet } from '@/lib/api'
import { requireRole } from '@/lib/auth/session'
import { getClasses } from '@/lib/catalogue'

const text = copy.admin.nav
const setup = copy.adminSetup
const fleet = copy.adminFleet

const entry = (group) => (href, label, icon) => ({ href, label, icon, group })
const work = entry(text.groupWork)
const supply = entry(text.groupSupply)
const price = entry(setup.groups.prices)
const place = entry(text.groupPlaces)
const content = entry(text.groupContent)
const system = entry(text.groupSystem)

// The admin's navigation, ordered by how often it is needed: what is waiting today, who supplies the cars, what
// they cost, where they go, then content and the system itself. From tablet up a labelled sidebar; on phones four
// tabs, the last of which opens the full list.
export const adminRail = [
  { ...work('/admin', text.overview, 'today'), isExact: true },
  work('/admin/enquiries', text.enquiries, 'inbox'),
  work('/admin/bookings', text.bookings, 'requests'),
  work('/admin/documents', text.documents, 'documents'),
  supply('/admin/operators', text.companies, 'companies'),
  supply('/admin/setup/drivers', fleet.nav.drivers, 'drivers'),
  price('/admin/setup/classes', setup.nav.classes, 'classes'),
  price('/admin/setup/rates', setup.nav.rates, 'rates'),
  price('/admin/setup/discounts', setup.nav.discounts, 'discounts'),
  price('/admin/setup/extras', setup.nav.extras, 'extras'),
  place('/admin/setup/locations', setup.nav.locations, 'locations'),
  place('/admin/setup/delivery-zones', setup.nav.zones, 'zones'),
  content('/admin/posts', text.guides, 'guides'),
  system('/admin/team', text.team, 'team'),
  system('/admin/settings', setup.nav.settings, 'settings'),
  system('/admin/audit', text.audit, 'audit'),
]

export const adminTabs = [
  { href: '/admin', label: text.overview, icon: 'today', isExact: true },
  { href: '/admin/bookings', label: text.bookings, icon: 'requests' },
  { href: '/admin/documents', label: text.documents, icon: 'documents' },
  { href: '/admin/menu', label: text.more, icon: 'more' },
]

/** One admin API call as the signed-in admin. */
export const adminGet = (path, token, query) => apiGet(path, { token, query })

/** Class names by id, for the lists that only carry the id. A failed lookup leaves the map empty. */
export async function getClassNames() {
  const { data } = await getClasses()
  return new Map((data ?? []).map((item) => [item.id, item.name]))
}

/**
 * The signed-in admin, for a page. The layout already sends everyone else away, but a page is drawn alongside its
 * layout, so it asks too and never runs with nobody signed in.
 */
export const requireAdmin = () => requireRole(['admin'], '/admin')

/** An API answer for one record. "Not found" (or an address that is not an id) shows the not-found page. */
export function orNotFound(result) {
  if (result.error === 'NOT_FOUND' || result.error === 'VALIDATION_FAILED') notFound()
  return result
}
