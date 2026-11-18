import { listPage } from '../lib/pagination.js'
import { unwrap } from '../lib/supabase.js'
import { findOne, insertOne, updateOne } from './records.js'

const VEHICLE_COLUMNS =
  'id, registration, chassis_number, make, model, year, class_id, status, mileage_km, ' +
  'home_location_id, owner_id, created_at'
const OWNER_SUMMARY = 'id, owner_type, full_name, phone, email, status'
const AGREEMENT_COLUMNS = 'id, owner_id, vehicle_id, commission_percent, starts_on, ends_on'
export const TRACKER_COLUMNS =
  'id, vehicle_id, provider, model, device_id, sim_number, installed_on, removed_on, status, ' +
  'subscription_expires_on, notes'

export const createVehicle = (db, input) => insertOne(db, 'vehicles', VEHICLE_COLUMNS, input)

export const updateVehicle = (db, id, input) =>
  updateOne(db, 'vehicles', VEHICLE_COLUMNS, id, input)

export const listVehicles = (db, { limit, cursor }) =>
  listPage(db.from('vehicles').select(VEHICLE_COLUMNS), { limit, cursor })

/** A vehicle with its owner (when it is a partner vehicle), agreement, and trackers. */
export async function getVehicle(db, id) {
  const vehicle = await findOne(db, 'vehicles', VEHICLE_COLUMNS, id)
  const [owner, agreements, trackers] = await Promise.all([
    vehicle.owner_id ? findOne(db, 'vehicle_owners', OWNER_SUMMARY, vehicle.owner_id) : null,
    db
      .from('ownership_agreements')
      .select(AGREEMENT_COLUMNS)
      .eq('vehicle_id', id)
      .order('starts_on'),
    db.from('vehicle_trackers').select(TRACKER_COLUMNS).eq('vehicle_id', id).order('created_at'),
  ])
  return {
    ...vehicle,
    is_partner_vehicle: vehicle.owner_id !== null,
    owner,
    agreements: unwrap(agreements),
    trackers: unwrap(trackers),
  }
}
