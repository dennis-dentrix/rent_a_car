import { copy } from '@/copy/en'
import { apiGet } from '@/lib/api'
import { orNotFound } from '@/lib/admin'
import { requireRole } from '@/lib/auth/session'

const text = copy.operatorConsole.nav

const entry = (group) => (href, label, icon) => ({ href, label, icon, group })
const run = entry(text.groupRun)
const fleet = entry(text.groupFleet)
const business = entry(text.groupSetup)

// The company's navigation, in the order of the work: today's hires, then the cars and what they cost, then how
// the company trades. From tablet up it is a labelled sidebar; on phones four tabs, and the rest in the menu.
export const consoleRail = [
  { ...run('/console', text.today, 'today'), isExact: true },
  { ...run('/console/bookings', text.bookings, 'requests'), badge: 'waiting_requests' },
  { ...run('/console/messages', copy.messages.title, 'messages'), badge: 'unread_messages' },
  run('/console/calendar', copy.calendar.title, 'calendar'),
  run('/console/inspections', copy.inspections.title, 'inspections'),
  fleet('/console/fleet', text.fleet, 'fleet'),
  fleet('/console/owners', text.owners, 'owners'),
  business('/console/company', text.company, 'company'),
  business('/console/services', text.services, 'services'),
  business('/console/places', text.places, 'places'),
  business('/console/policies', copy.policies.page.title, 'policies'),
]

export const consoleTabs = [
  { href: '/console', label: text.today, icon: 'today', isExact: true },
  { href: '/console/bookings', label: text.bookings, icon: 'requests', badge: 'waiting_requests' },
  {
    href: '/console/messages',
    label: copy.messages.title,
    icon: 'messages',
    badge: 'unread_messages',
  },
  { href: '/console/fleet', label: text.fleet, icon: 'fleet' },
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

/** One record for a console page: asks who is signed in, then reads it. A record that is not theirs is "not found". */
export async function loadForOperator(path) {
  const { token } = await requireOperator()
  return orNotFound(await consoleGet(path, token))
}
