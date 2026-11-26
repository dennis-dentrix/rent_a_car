import { unwrap } from '../lib/supabase.js'

// What a chat is about, for both sides: the car, and whether the renter has it reserved.
const CAR_COLUMNS = 'id, class_id, make, model, year, photo_paths, daily_rate_kes'
const BOOKING_COLUMNS = 'id, status, start_at, end_at, total_kes, hold_expires_at'
// A booking that still stands. A cancelled, declined, or expired one leaves the car unreserved.
const STANDING = ['requested', 'pending_payment', 'confirmed', 'ready', 'active', 'returned']

// Null when the car is no longer listed: the chat keeps its name, which was saved with it.
async function carPreview(db, vehicleId) {
  const car = unwrap(
    await db.from('public_vehicles').select(CAR_COLUMNS).eq('id', vehicleId).maybeSingle(),
  )
  if (!car) return null
  const { class_id: classId, ...shown } = car
  const found = unwrap(
    await db.from('vehicle_classes').select('slug').eq('id', classId).maybeSingle(),
  )
  return { ...shown, class_slug: found?.slug ?? null }
}

const latestBooking = async (db, { vehicle_id: vehicleId, renter_id: renterId }) =>
  unwrap(
    await db
      .from('bookings')
      .select(BOOKING_COLUMNS)
      .eq('vehicle_id', vehicleId)
      .eq('customer_id', renterId)
      .in('status', STANDING)
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle(),
  )

export async function chatContext(db, conversation) {
  const [car, booking] = await Promise.all([
    carPreview(db, conversation.vehicle_id),
    latestBooking(db, conversation),
  ])
  return { car, booking }
}
