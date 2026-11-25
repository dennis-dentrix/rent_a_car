'use server'

import { revalidatePath } from 'next/cache'
import { adminSend } from '@/lib/admin-send'

// Changes made to one car from its page, for the admin and for an operator: the same calls, on the API of whoever is asking (`scope`). The API
// decides whose cars the signed-in person may change.
const AREAS = {
  admin: { api: '/admin', pages: '/admin/vehicles' },
  console: { api: '/operator', pages: '/console/fleet' },
}

const send = (method, { scope, vehicleId }, path, body) =>
  adminSend(method, `${AREAS[scope].api}/vehicles/${encodeURIComponent(vehicleId)}/${path}`, body)

async function change(method, car, path, body) {
  const result = await send(method, car, path, body)
  if (!result.error) revalidatePath(`${AREAS[car.scope].pages}/${car.vehicleId}`)
  return result
}

export async function requestPhotoUploadAction(car, declaration) {
  return send('POST', car, 'photo-uploads', declaration)
}

export async function addPhotoAction(car, photo) {
  return change('POST', car, 'photos', photo)
}

export async function removePhotoAction(car, storagePath) {
  return change('DELETE', car, 'photos', { storage_path: storagePath })
}

/** Gives a car its own price per day, or takes it away (null) so the class rate applies. */
export async function setCarRateAction(car, dailyRate) {
  const { api, pages } = AREAS[car.scope]
  const result = await adminSend('PATCH', `${api}/vehicles/${encodeURIComponent(car.vehicleId)}`, {
    daily_rate_kes: dailyRate,
  })
  if (!result.error) revalidatePath(`${pages}/${car.vehicleId}`)
  return result
}
