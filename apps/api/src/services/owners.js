import { listPage } from '../lib/pagination.js'
import { unwrap } from '../lib/supabase.js'
import { findOne, insertOne } from './records.js'

const OWNER_COLUMNS = 'id, owner_type, full_name, phone, email, kra_pin, status, notes, created_at'
const PRIVATE_COLUMNS =
  'owner_id, national_id_number, payout_method, payout_account, payout_account_name'
const AGREEMENT_COLUMNS =
  'id, owner_id, vehicle_id, commission_percent, starts_on, ends_on, agreement_storage_path, notes'

/** Create a private owner. National ID and payout details are saved separately, admin only. */
export async function createOwner(db, { private: details, ...owner }) {
  const created = await insertOne(db, 'vehicle_owners', OWNER_COLUMNS, owner)
  if (!details) return { ...created, private: null }
  try {
    const saved = await insertOne(db, 'vehicle_owner_private', PRIVATE_COLUMNS, {
      owner_id: created.id,
      ...details,
    })
    return { ...created, private: saved }
  } catch (error) {
    await db.from('vehicle_owners').delete().eq('id', created.id)
    throw error
  }
}

export const listOwners = (db, { limit, cursor }) =>
  listPage(db.from('vehicle_owners').select(OWNER_COLUMNS), { limit, cursor })

/** An owner with private details, the vehicles they own, and their agreements. */
export async function getOwner(db, id) {
  const owner = await findOne(db, 'vehicle_owners', OWNER_COLUMNS, id)
  const [details, vehicles, agreements] = await Promise.all([
    db.from('vehicle_owner_private').select(PRIVATE_COLUMNS).eq('owner_id', id).maybeSingle(),
    db.from('vehicles').select('id, registration, chassis_number, make, model').eq('owner_id', id),
    db.from('ownership_agreements').select(AGREEMENT_COLUMNS).eq('owner_id', id).order('starts_on'),
  ])
  return {
    ...owner,
    private: unwrap(details),
    vehicles: unwrap(vehicles),
    agreements: unwrap(agreements),
  }
}

/** Rent a vehicle out for an owner. The first agreement makes the owner the vehicle's owner. */
export async function createAgreement(db, ownerId, input) {
  await findOne(db, 'vehicle_owners', 'id', ownerId)
  await findOne(db, 'vehicles', 'id', input.vehicle_id)
  return insertOne(db, 'ownership_agreements', AGREEMENT_COLUMNS, { owner_id: ownerId, ...input })
}
