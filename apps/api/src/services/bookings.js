import { z } from 'zod'
import { AppError, fieldError } from '../lib/errors.js'
import { unwrap, withServiceRole } from '../lib/supabase.js'
import { listPage } from '../lib/pagination.js'
import { buildTimeline } from '../domain/booking-timeline.js'
import { findOne } from './records.js'

// The fields a customer sees on every booking response. Nothing else leaves the server.
const SUMMARY_FIELDS = [
  'id',
  'reference',
  'status',
  'start_at',
  'end_at',
  'handover_type',
  'pickup_location_id',
  'class_id',
  'total_kes',
  'deposit_kes',
  'security_deposit_kes',
  'balance_kes',
  'hold_expires_at',
  'refund_due_kes',
  'date_changes',
]
export const LIST_COLUMNS = [...SUMMARY_FIELDS, 'created_at'].join(', ')

// Tingg checkout is added with the payment module; until then no payment link is returned.
export const toSummary = (booking) => ({
  ...Object.fromEntries(SUMMARY_FIELDS.map((field) => [field, booking[field]])),
  payment_url: null,
})

/** Save the customer's details on their profile and check any company they bill to. */
async function prepareCustomer(db, userId, customer) {
  const profile = unwrap(await db.from('profiles').select('*').eq('id', userId).maybeSingle())
  if (!profile) throw new AppError('FORBIDDEN', { message: 'Your account has no profile yet.' })
  if (customer.company_id && customer.company_id !== profile.company_id) {
    throw new AppError('FORBIDDEN', { message: 'You do not belong to that company.' })
  }
  const taken = unwrap(
    await db.from('profiles').select('id').eq('phone', customer.phone).neq('id', userId).limit(1),
  )
  if (taken.length > 0) throw fieldError('customer.phone', 'This phone number is already in use.')
  unwrap(
    await db
      .from('profiles')
      .update({ full_name: customer.full_name, phone: customer.phone, email: customer.email })
      .eq('id', userId),
  )
}

/** Turn an unexpired quote into a booking that holds a vehicle. Requires a signed-in customer. */
export async function createBooking({ user }, input) {
  return withServiceRole('create_booking', async (db) => {
    await prepareCustomer(db, user.id, input.customer)
    const booking = unwrap(
      await db.rpc('create_booking_from_quote', {
        p_quote_id: input.quote_id,
        p_customer_id: user.id,
        p_company_id: input.customer.company_id ?? null,
      }),
    )
    return toSummary(booking)
  })
}

/** The caller's own bookings, newest first. Row Level Security limits the rows to theirs. */
export async function listBookings({ db }, { status, limit, cursor }) {
  const query = db.from('bookings').select(LIST_COLUMNS)
  const page = await listPage(status ? query.eq('status', status) : query, { limit, cursor })
  return { ...page, data: page.data.map(toSummary) }
}

const related = (db, table, columns, bookingId) =>
  db.from(table).select(columns).eq('booking_id', bookingId).order('created_at')

/** One booking with its timeline, documents (type and status only), delivery, and payments. */
export async function getBooking({ db }, id) {
  if (!z.uuid().safeParse(id).success) throw new AppError('NOT_FOUND')
  const booking = await findOne(db, 'bookings', LIST_COLUMNS, id)
  const [events, documents, payments, deliveries] = await Promise.all([
    related(db, 'booking_status_events', 'to_status, created_at', id),
    related(db, 'documents', 'id, type, status, rejection_reason', id),
    related(db, 'payments', 'kind, method, amount_kes, status, paid_at', id),
    related(db, 'deliveries', 'address, window_start, window_end, status', id),
  ]).then((results) => results.map(unwrap))
  return {
    ...toSummary(booking),
    timeline: buildTimeline(booking.status, events),
    documents,
    payments,
    handover: { type: booking.handover_type, delivery: deliveries[0] ?? null },
  }
}

/** Release unpaid holds whose 30 minutes have passed. Returns how many bookings expired. */
export async function expireUnpaidBookings() {
  return withServiceRole('expire_unpaid_bookings', async (db) =>
    unwrap(await db.rpc('expire_unpaid_bookings')),
  )
}
