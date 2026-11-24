import { copy } from '@/copy/en'
import { apiGet } from '@/lib/api'
import { requireRole } from '@/lib/auth/session'
import { getClasses } from '@/lib/catalogue'

const text = copy.admin.nav

// The admin's navigation: a labelled side rail from tablet up, and on phones four tabs, the last of which opens the
// full list.
export const adminRail = [
  { href: '/admin', label: text.overview, icon: 'today', isExact: true, group: text.groupWork },
  { href: '/admin/bookings', label: text.bookings, icon: 'requests', group: text.groupWork },
  { href: '/admin/enquiries', label: text.enquiries, icon: 'inbox', group: text.groupWork },
  { href: '/admin/documents', label: text.documents, icon: 'documents', group: text.groupWork },
  { href: '/admin/operators', label: text.companies, icon: 'companies', group: text.groupWork },
  { href: '/admin/posts', label: text.guides, icon: 'guides', group: text.groupContent },
  { href: '/admin/team', label: text.team, icon: 'team', group: text.groupSetup },
  { href: '/admin/audit', label: text.audit, icon: 'audit', group: text.groupSetup },
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
