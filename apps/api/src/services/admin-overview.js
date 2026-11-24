import { nairobiDate, nairobiDayRange } from '@rent-a-car/shared'
import { listPage } from '../lib/pagination.js'
import { unwrap } from '../lib/supabase.js'

// Each number on the admin's first page is one cheap count. The set is fixed, so the queries never grow with the data.
const count = async (db, table, narrow) => {
  const result = await narrow(db.from(table).select('id', { count: 'exact', head: true }))
  unwrap(result)
  return result.count ?? 0
}

const COUNTS = {
  companies_pending: (db) => count(db, 'operators', (q) => q.eq('status', 'pending')),
  documents_to_review: (db) =>
    count(db, 'documents', (q) => q.eq('status', 'uploaded').not('file_confirmed_at', 'is', null)),
  enquiries_open: (db) => count(db, 'enquiries', (q) => q.is('converted_booking_id', null)),
  bookings_to_confirm: (db) => count(db, 'bookings', (q) => q.eq('status', 'pending_payment')),
  guides_draft: (db) => count(db, 'posts', (q) => q.eq('status', 'draft')),
  rentals_active: (db) => count(db, 'bookings', (q) => q.eq('status', 'active')),
}

const todayCounts = (db, [from, to]) => ({
  pickups_today: count(db, 'bookings', (q) =>
    q.in('status', ['confirmed', 'ready']).gte('start_at', from).lt('start_at', to),
  ),
  returns_today: count(db, 'bookings', (q) =>
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
