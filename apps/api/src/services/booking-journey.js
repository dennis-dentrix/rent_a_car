import { buildTimeline } from '../domain/booking-timeline.js'
import { unwrap } from '../lib/supabase.js'
import { findOne } from './records.js'

const forBooking = (db, table, columns, id) => db.from(table).select(columns).eq('booking_id', id)

/** The journey of a booking the caller may see (Row Level Security decides). A fixed number of queries. */
export async function getJourney({ db }, id) {
  const booking = await findOne(db, 'bookings', 'status, handover_type, created_at, no_show_at', id)
  const [events, milestones, signatures] = await Promise.all([
    forBooking(db, 'booking_status_events', 'to_status, created_at', id).order('created_at'),
    forBooking(db, 'booking_milestones', 'step, created_at', id),
    forBooking(db, 'agreement_signatures', 'signed_at', id).is('voided_at', null),
  ]).then((results) => results.map(unwrap))
  return {
    ...buildTimeline({ booking, events, milestones, signedAt: signatures[0]?.signed_at }),
    status: booking.status,
    no_show_at: booking.no_show_at,
  }
}

/** The company records the next step with one tap. The database checks the booking allows it. */
export async function recordMilestone(auth, id, step) {
  unwrap(await auth.db.rpc('record_milestone', { p_booking_id: id, p_step: step }))
  return getJourney(auth, id)
}

export async function markNoShow(auth, id) {
  unwrap(await auth.db.rpc('mark_no_show', { p_booking_id: id }))
  return getJourney(auth, id)
}

/** Confirmed, cancelled, and not-turned-up bookings for each of the last weeks. Staff only. */
export const bookingOutcomes = async ({ db }) =>
  unwrap(await db.rpc('booking_outcomes', { p_weeks: 8 }))
