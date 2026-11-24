import { listPage } from '../lib/pagination.js'
import { unwrap } from '../lib/supabase.js'
import { findOne } from './records.js'

const LIST_COLUMNS = 'id, business_name, slug, phone, email, status, created_at'
const DETAIL_COLUMNS = `${LIST_COLUMNS}, registration_number, kra_pin, address, status_reason, verified_at, verified_by, plan, updated_at`

/**
 * The signed-in customer starts a rental company. The database makes them its first person and files the company as
 * `pending`; renters do not see it until an admin approves. Only an ordinary customer account may do this.
 */
export async function registerOperator(db, { business_name: name, phone }) {
  return unwrap(
    await db.rpc('register_operator', { p_business_name: name, p_phone: phone ?? null }),
  )
}

/** Rental companies for the admin's review queue, newest first, optionally only those with one status. */
export function listOperators(db, { status, limit, cursor }) {
  const query = db.from('operators').select(LIST_COLUMNS)
  return listPage(status ? query.eq('status', status) : query, { limit, cursor })
}

export const getOperator = (db, id) => findOne(db, 'operators', DETAIL_COLUMNS, id)

/** An admin approves, rejects, or suspends a company. The database checks the move is allowed and a "no" has a reason. */
export async function reviewOperator(db, id, { to, reason }) {
  return unwrap(
    await db.rpc('review_operator', {
      p_operator_id: id,
      p_to: to,
      p_reason: reason ?? null,
    }),
  )
}
