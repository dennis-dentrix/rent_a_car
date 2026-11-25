'use server'

import { revalidatePath } from 'next/cache'
import { adminSend } from '@/lib/admin-send'

/** Serve or stop serving one of Carvo's airports or airstrips. Resolves true when the server kept the change. */
export async function setAirportServedAction(id, isServed) {
  const result = await adminSend('PUT', `/operator/airports/${encodeURIComponent(id)}`, {
    is_served: isServed,
  })
  return !result.error
}

/** Replaces the set of services the company offers. Resolves true when the server kept it. */
export async function setServicesAction(serviceIds) {
  const result = await adminSend('PUT', '/operator/services', { services: serviceIds })
  if (result.error) return false
  revalidatePath('/console')
  return true
}

// One tap on a booking. Resolves true when the server kept it, so the button can say when it did not.
async function tap(bookingId, path, body) {
  const result = await adminSend(
    'POST',
    `/operator/bookings/${encodeURIComponent(bookingId)}/${path}`,
    body,
  )
  revalidatePath(`/console/bookings/${bookingId}`)
  return !result.error
}

export async function recordMilestoneAction(bookingId, step) {
  return tap(bookingId, 'milestones', { step })
}

export async function markNoShowAction(bookingId) {
  return tap(bookingId, 'no-show')
}

/** Changes the company's price per day for a class, from today. */
export async function setClassRateAction(classId, price) {
  const result = await adminSend('PUT', `/operator/classes/${encodeURIComponent(classId)}/rate`, {
    price_kes: price,
  })
  if (!result.error) revalidatePath('/console/classes')
  return result
}
