import { unwrap } from '../lib/supabase.js'

/** The services a renter can filter by, in display order. Public reference data. */
export async function listServices(db) {
  return unwrap(
    await db.from('services').select('id, service_group').eq('is_active', true).order('sort_order'),
  )
}

/** The ids of the services an operator offers. */
export async function getOperatorServices(db, operatorId) {
  const rows = unwrap(
    await db.from('operator_services').select('service_id').eq('operator_id', operatorId),
  )
  return rows.map((row) => row.service_id).sort()
}

/** Replace the set an operator offers, in one database call. The database checks who may and which ids exist. */
export async function setOperatorServices(db, operatorId, serviceIds) {
  return unwrap(
    await db.rpc('set_operator_services', { p_operator_id: operatorId, p_services: serviceIds }),
  )
}
