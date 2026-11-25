import { randomUUID } from 'node:crypto'
import { MAX_VEHICLE_PHOTOS } from '@carvo/shared'
import { fieldError } from '../lib/errors.js'
import {
  assertUploaded,
  createUploadUrl,
  removeStoredFiles,
  vehiclePhotoKey,
} from '../lib/storage.js'
import { unwrap } from '../lib/supabase.js'
import { findOne } from './records.js'

// A car the caller may change, with its photos. Row Level Security hides anyone else's, which reads as not found.
async function carWithRoom(db, vehicleId) {
  const car = await findOne(db, 'vehicles', 'id, photo_paths', vehicleId)
  if (car.photo_paths.length >= MAX_VEHICLE_PHOTOS) {
    throw fieldError('photo', `A car can have ${MAX_VEHICLE_PHOTOS} photos. Remove one first.`)
  }
  return car
}

/** A link to upload one photo of a car to. */
export async function createPhotoUpload(
  db,
  vehicleId,
  { content_type: contentType, size_bytes: sizeBytes },
) {
  await carWithRoom(db, vehicleId)
  const key = vehiclePhotoKey(vehicleId, randomUUID(), contentType)
  return { storage_path: key, ...(await createUploadUrl({ key, contentType, sizeBytes })) }
}

/** Adds an uploaded photo to the car, after checking it is what it claims. */
export async function addPhoto(db, vehicleId, input) {
  await carWithRoom(db, vehicleId)
  if (!input.storage_path.startsWith(`vehicles/${vehicleId}/`)) {
    throw fieldError('storage_path', 'That file is not for this car. Request an upload link first.')
  }
  await assertUploaded(input.storage_path, {
    sizeBytes: input.size_bytes,
    contentType: input.content_type,
    purpose: 'vehicle_photo',
  })
  const paths = unwrap(
    await db.rpc('add_vehicle_photo', { p_vehicle_id: vehicleId, p_path: input.storage_path }),
  )
  return { id: vehicleId, photo_paths: paths }
}

/** Takes a photo off the car and deletes its file. */
export async function removePhoto(db, vehicleId, { storage_path: path }) {
  const paths = unwrap(
    await db.rpc('remove_vehicle_photo', { p_vehicle_id: vehicleId, p_path: path }),
  )
  await removeStoredFiles([path])
  return { id: vehicleId, photo_paths: paths }
}
