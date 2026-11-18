import { findOne, insertOne, updateOne } from './records.js'
import { TRACKER_COLUMNS } from './vehicles.js'

/** Record a tracker fitted to a vehicle. Only one tracker per vehicle can be active. */
export async function addTracker(db, vehicleId, input) {
  await findOne(db, 'vehicles', 'id', vehicleId)
  return insertOne(db, 'vehicle_trackers', TRACKER_COLUMNS, { vehicle_id: vehicleId, ...input })
}

export const updateTracker = (db, id, input) =>
  updateOne(db, 'vehicle_trackers', TRACKER_COLUMNS, id, input)
