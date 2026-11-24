import { nairobiDate, nairobiDayRange } from '@carvo/shared'
import { listPage } from '../lib/pagination.js'
import { countRows } from '../lib/counts.js'

const COUNTS = {
  companies_pending: (db) => countRows(db, 'operators', (q) => q.eq('status', 'pending')),
  documents_to_review: (db) =>
    countRows(db, 'documents', (q) =>
      q.eq('status', 'uploaded').not('file_confirmed_at', 'is', null),
    ),
  enquiries_open: (db) => countRows(db, 'enquiries', (q) => q.is('converted_booking_id', null)),
  bookings_to_confirm: (db) => countRows(db, 'bookings', (q) => q.eq('status', 'pending_payment')),
  guides_draft: (db) => countRows(db, 'posts', (q) => q.eq('status', 'draft')),
  rentals_active: (db) => countRows(db, 'bookings', (q) => q.eq('status', 'active')),
}

const todayCounts = (db, [from, to]) => ({
  pickups_today: countRows(db, 'bookings', (q) =>
    q.in('status', ['confirmed', 'ready']).gte('start_at', from).lt('start_at', to),
  ),
  returns_today: countRows(db, 'bookings', (q) =>
    q.eq('status', 'active').gte('end_at', from).lt('end_at', to),
  ),
})

/** What needs the admin's attention now, and what is happening today (Nairobi). */
export async function getOverview({ db }, now = new Date()) {
  const today = nairobiDate(now)
  const pending = {
    ...Object.fromEntries(Object.entries(COUNTS).map(([key, run]) => [key, run(db)])),
    ...todayCounts(db, nairobiDayRange(today)),
  }
  const entries = await Promise.all(
    Object.entries(pending).map(async ([key, value]) => [key, await value]),
  )
  return { today, ...Object.fromEntries(entries) }
}

const withActorName = (rows) =>
  rows.map(({ actor, ...entry }) => ({ ...entry, actor: actor?.full_name ?? null }))

/** The audit log, newest first, with the name of whoever made each change. */
export async function listAudit({ db }, { limit, cursor }) {
  const query = db
    .from('audit_log')
    .select('id, action, table_name, row_id, created_at, actor:profiles(full_name)')
  const page = await listPage(query, { limit, cursor })
  return { ...page, data: withActorName(page.data) }
}
