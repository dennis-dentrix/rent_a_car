import { z } from 'zod'
import { AppError, fieldError } from '../lib/errors.js'
import { unwrap, withServiceRole } from '../lib/supabase.js'
import { listPage } from '../lib/pagination.js'
import { getJourney } from './booking-journey.js'
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
  'destination',
]
export const LIST_COLUMNS = [...SUMMARY_FIELDS, 'created_at'].join(', ')
// Where the trip starts and goes, and what was asked of the company. Part of one booking, not of a list.
const TRIP_FIELDS = ['pickup_place', 'destination', 'wants_dropoff', 'wants_pickup']
const DETAIL_COLUMNS = `${LIST_COLUMNS}, ${TRIP_FIELDS.join(', ')}`

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

// A particular car is confirmed at once or requested from its company; the database applies the age rule and saves
// the trip details.
function bookCar(db, userId, input) {
  const { quote_id: quoteId, customer, destination, pickup_place: pickup } = input
  if (!customer.date_of_birth) {
    throw fieldError('customer.date_of_birth', 'Enter your date of birth.')
  }
  if (!destination) throw fieldError('destination', 'Say where you are going.')
  if (!pickup) throw fieldError('pickup_place', 'Say where you are renting from.')
  return db.rpc('book_car', {
    p_quote_id: quoteId,
    p_customer_id: userId,
    p_date_of_birth: customer.date_of_birth,
    p_destination: destination,
    p_pickup_place: pickup,
    p_wants_dropoff: input.wants_dropoff ?? false,
    p_wants_pickup: input.wants_pickup ?? false,
  })
}

// Any car of a class waits for payment or staff, and is held meanwhile.
const holdForClass = (db, userId, { quote_id: quoteId, customer }) =>
  db.rpc('create_booking_from_quote', {
    p_quote_id: quoteId,
    p_customer_id: userId,
    p_company_id: customer.company_id ?? null,
  })

/** Turn an unexpired quote into a booking. Requires a signed-in customer. */
export async function createBooking({ user }, input) {
  return withServiceRole('create_booking', async (db) => {
    await prepareCustomer(db, user.id, input.customer)
    const quote = unwrap(
      await db.from('quotes').select('vehicle_id').eq('id', input.quote_id).maybeSingle(),
    )
    const book = quote?.vehicle_id ? bookCar : holdForClass
    return toSummary(unwrap(await book(db, user.id, input)))
  })
}

// A booking with news changed without the renter, who has not opened it since.
const withNews = ({ news, ...booking }) => ({
  ...toSummary(booking),
  has_news: Boolean(news?.length ?? news),
})

/** The caller's own bookings, newest first. Row Level Security limits the rows to theirs. */
export async function listBookings({ db }, { status, limit, cursor }) {
  const query = db.from('bookings').select(`${LIST_COLUMNS}, news:booking_news(booking_id)`)
  const page = await listPage(status ? query.eq('status', status) : query, { limit, cursor })
  return { ...page, data: page.data.map(withNews) }
}

export async function markBookingSeen({ db }, id) {
  unwrap(await db.rpc('mark_booking_seen', { p_booking_id: id }))
  return { id }
}

const related = (db, table, columns, bookingId) =>
  db.from(table).select(columns).eq('booking_id', bookingId).order('created_at')

/** One booking with its timeline, documents (type and status only), delivery, and payments. */
export async function getBooking({ db }, id) {
  if (!z.uuid().safeParse(id).success) throw new AppError('NOT_FOUND')
  const booking = await findOne(db, 'bookings', DETAIL_COLUMNS, id)
  const [journey, documents, payments, deliveries] = await Promise.all([
    getJourney({ db }, id),
    related(db, 'documents', 'id, type, status, rejection_reason, file_confirmed_at', id),
    related(db, 'payments', 'kind, method, amount_kes, status, paid_at', id),
    related(db, 'deliveries', 'address, window_start, window_end, status', id),
  ])
  return {
    ...toSummary(booking),
    ...Object.fromEntries(TRIP_FIELDS.map((field) => [field, booking[field]])),
    journey,
    documents: unwrap(documents),
    payments: unwrap(payments),
    handover: { type: booking.handover_type, delivery: unwrap(deliveries)[0] ?? null },
  }
}

/** Release unpaid holds whose 30 minutes have passed. Returns how many bookings expired. */
export async function expireUnpaidBookings() {
  return withServiceRole(
    'expire_unpaid_bookings',
    async (db) =>
      unwrap(await db.rpc('expire_unpaid_bookings')) +
      unwrap(await db.rpc('expire_unanswered_requests')),
  )
}

// The number plate and the company's phone are shared once the hire is agreed (product pack section 25.3).
const AGREED = ['confirmed', 'ready', 'active', 'returned', 'closed']
const TRIP_PARTIES =
  'vehicle:vehicles(make, model, year, registration, photo_paths), operator:operators(business_name, phone)'

/**
 * A renter's trip: the booking, their car, and the company. Renters cannot read cars or companies, so those are read
 * for them, only after the booking itself was found as the caller.
 */
export async function getTrip(auth, id) {
  const booking = await getBooking(auth, id)
  const { vehicle, operator } = await withServiceRole('read_trip_parties', (admin) =>
    findOne(admin, 'bookings', TRIP_PARTIES, id),
  )
  const isAgreed = AGREED.includes(booking.status)
  return {
    ...booking,
    car: vehicle && { ...vehicle, registration: isAgreed ? vehicle.registration : null },
    company: operator && {
      name: operator.business_name,
      phone: isAgreed ? operator.phone : null,
    },
  }
}
