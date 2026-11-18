import { brand } from '@rent-a-car/shared'
import { unwrap, withServiceRole } from '../lib/supabase.js'

const BOOKING_COLUMNS =
  'id, reference, status, start_at, end_at, handover_type, total_kes, deposit_kes, security_deposit_kes, ' +
  'balance_kes, customer_id, vehicle_id, class_id, pickup_location_id'
const RULE_KEYS = ['late_return_grace_minutes', 'cancellation_window_hours', 'minimum_age']

const one = (query) => query.maybeSingle().then(unwrap)

async function pickupPlace(admin, booking) {
  if (booking.handover_type === 'delivery') {
    const delivery = await one(
      admin.from('deliveries').select('address').eq('booking_id', booking.id),
    )
    return `Delivery to ${delivery?.address ?? 'the address given'}`
  }
  if (!booking.pickup_location_id) return `${brand.name} office`
  const place = await one(
    admin.from('locations').select('name, address').eq('id', booking.pickup_location_id),
  )
  return `${place.name}, ${place.address}`
}

const describeVehicle = (vehicle, klass) => ({
  class_name: klass.name,
  description:
    [vehicle?.make, vehicle?.model, vehicle?.year].filter(Boolean).join(' ') || klass.name,
  registration: vehicle?.registration ?? 'to be confirmed at handover',
})

const bookingFacts = (booking, pickup) => ({
  reference: booking.reference,
  status: booking.status,
  start_at: booking.start_at,
  end_at: booking.end_at,
  handover_type: booking.handover_type,
  pickup_place: pickup,
  total_kes: booking.total_kes,
  deposit_kes: booking.deposit_kes,
  security_deposit_kes: booking.security_deposit_kes,
  balance_kes: booking.balance_kes,
})

function shapeFacts({ booking, customer, vehicle, pickup, settings }) {
  const rule = (key) => settings.find((row) => row.key === key).value
  return {
    booking: bookingFacts(booking, pickup),
    customer,
    vehicle,
    rules: {
      grace_minutes: rule('late_return_grace_minutes'),
      cancellation_window_hours: rule('cancellation_window_hours'),
      minimum_age: rule('minimum_age'),
    },
  }
}

/**
 * Everything the agreement says about a booking, read with the service role because customers cannot read vehicles
 * or settings. Only the facts that go into the agreement are returned, and the caller has already checked that the
 * caller may see this booking. Nothing here changes between two reads unless the booking or settings change.
 */
export async function loadAgreementFacts(bookingId) {
  return withServiceRole('agreement_facts', async (admin) => {
    const booking = await one(admin.from('bookings').select(BOOKING_COLUMNS).eq('id', bookingId))
    const [customer, vehicle, klass, pickup, settings] = await Promise.all([
      one(admin.from('profiles').select('full_name, email, phone').eq('id', booking.customer_id)),
      booking.vehicle_id
        ? one(
            admin
              .from('vehicles')
              .select('make, model, year, registration')
              .eq('id', booking.vehicle_id),
          )
        : null,
      one(admin.from('vehicle_classes').select('name').eq('id', booking.class_id)),
      pickupPlace(admin, booking),
      admin.from('settings').select('key, value').in('key', RULE_KEYS).then(unwrap),
    ])
    return shapeFacts({
      booking,
      customer,
      vehicle: describeVehicle(vehicle, klass),
      pickup,
      settings,
    })
  })
}
