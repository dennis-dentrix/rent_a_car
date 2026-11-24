import { notFound } from 'next/navigation'
import { copy } from '@/copy/en'
import { apiGet } from '@/lib/api'
import { requireRole } from '@/lib/auth/session'
import { getClasses } from '@/lib/catalogue'

const text = copy.admin.nav
const setup = copy.adminSetup
const fleet = copy.adminFleet

// The admin's navigation: a labelled side rail from tablet up, and on phones four tabs, the last of which opens the
// full list.
export const adminRail = [
  { href: '/admin', label: text.overview, icon: 'today', isExact: true, group: text.groupWork },
  { href: '/admin/bookings', label: text.bookings, icon: 'requests', group: text.groupWork },
  { href: '/admin/enquiries', label: text.enquiries, icon: 'inbox', group: text.groupWork },
  { href: '/admin/documents', label: text.documents, icon: 'documents', group: text.groupWork },
  { href: '/admin/operators', label: text.companies, icon: 'companies', group: text.groupWork },
  { href: '/admin/posts', label: text.guides, icon: 'guides', group: text.groupContent },
  {
    href: '/admin/setup/classes',
    label: setup.nav.classes,
    icon: 'prices',
    group: setup.groups.prices,
  },
  {
    href: '/admin/setup/rates',
    label: setup.nav.rates,
    icon: 'prices',
    group: setup.groups.prices,
  },
  {
    href: '/admin/setup/discounts',
    label: setup.nav.discounts,
    icon: 'prices',
    group: setup.groups.prices,
  },
  {
    href: '/admin/setup/extras',
    label: setup.nav.extras,
    icon: 'prices',
    group: setup.groups.prices,
  },
  {
    href: '/admin/setup/delivery-zones',
    label: setup.nav.zones,
    icon: 'places',
    group: setup.groups.places,
  },
  {
    href: '/admin/setup/locations',
    label: setup.nav.locations,
    icon: 'places',
    group: setup.groups.places,
  },
  {
    href: '/admin/settings',
    label: setup.nav.settings,
    icon: 'settings',
    group: setup.groups.places,
  },
  { href: '/admin/team', label: text.team, icon: 'team', group: setup.groups.places },
  { href: '/admin/audit', label: text.audit, icon: 'audit', group: setup.groups.places },
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
