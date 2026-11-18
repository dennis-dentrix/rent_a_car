import { AppError, fieldError } from '../lib/errors.js'
import { unwrap, withServiceRole } from '../lib/supabase.js'
import { toSummary } from './bookings.js'
import { createQuote } from './quotes.js'
import { findOne } from './records.js'

/** What cancelling would do right now: the refund, and whether the no-refund window has started. */
export const previewCancellation = ({ db }, id) =>
  db.rpc('cancellation_preview', { p_booking_id: id }).then(unwrap)

/** Cancel the caller's own booking. The database applies the 24-hour policy and records the refund owed. */
export async function cancelBooking({ db }, id, { reason, acknowledged_no_refund }) {
  const preview = await previewCancellation({ db }, id)
  if (preview.policy_window === 'no_refund' && !acknowledged_no_refund) {
    throw fieldError(
      'acknowledged_no_refund',
      'Pickup is too close for a refund. Confirm that you understand no refund is due.',
    )
  }
  return unwrap(
    await db.rpc('cancel_booking', {
      p_booking_id: id,
      p_reason: reason ?? null,
      p_acknowledged: acknowledged_no_refund ?? false,
    }),
  )
}

const moveIso = (iso, milliseconds) =>
  new Date(new Date(iso).getTime() + milliseconds).toISOString()

/** The quote request for the new dates: same class, extras, currency, and service as the original quote. */
function quoteInputFor(booking, quote, { start_at, end_at }) {
  const shift = new Date(start_at).getTime() - new Date(booking.start_at).getTime()
  const delivery = quote.handover_type === 'delivery'
  return {
    class_id: booking.class_id,
    start_at,
    end_at,
    handover: delivery
      ? {
          type: 'delivery',
          address: quote.delivery_address,
          delivery_zone_id: quote.delivery_zone_id,
          window_start: moveIso(quote.delivery_window_start, shift),
          window_end: moveIso(quote.delivery_window_end, shift),
        }
      : { type: 'office' },
    pickup_location_id: quote.pickup_location_id,
    extras: quote.extra_ids,
    currency: quote.display_currency,
    service: quote.service,
  }
}

/**
 * Move the caller's booking to new dates. The price is worked out again from the rate table as a new quote,
 * then the database applies it if the change is allowed: not too close to pickup, within the number of
 * changes allowed, and a vehicle of the class is free.
 */
export async function changeBookingDates({ db }, id, dates) {
  const booking = unwrap(
    await db.from('bookings').select('id, class_id, start_at, quote_id').eq('id', id).maybeSingle(),
  )
  if (!booking) throw new AppError('NOT_FOUND')
  const original = await withServiceRole('read_booking_quote', (admin) =>
    findOne(admin, 'quotes', '*', booking.quote_id),
  )
  const quote = await createQuote(quoteInputFor(booking, original, dates))
  const changed = unwrap(
    await db.rpc('change_booking_dates', { p_booking_id: id, p_quote_id: quote.id }),
  )
  return { booking: toSummary(changed), breakdown: quote.breakdown }
}
