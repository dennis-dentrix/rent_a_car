import { nairobiDayRange } from '@rent-a-car/shared'
import { listPage } from '../lib/pagination.js'
import { unwrap, withServiceRole } from '../lib/supabase.js'
import { LIST_COLUMNS, getBooking, toSummary } from './bookings.js'
import { findOrCreateCustomer } from './customers.js'
import { findOpenEnquiry, markEnquiryConverted } from './enquiries.js'
import { createQuote } from './quotes.js'
import { findOne } from './records.js'

const WITH_PEOPLE = `${LIST_COLUMNS}, customer:profiles(full_name, phone, email), vehicle:vehicles(registration, make, model)`

const toStaffSummary = ({ customer, vehicle, ...booking }) => ({
  ...toSummary(booking),
  customer,
  vehicle,
})

/** The inbox: every booking, newest first, filtered by status, start date, or handover type. */
export async function listStaffBookings({ db }, { status, date, handover_type, limit, cursor }) {
  let query = db.from('bookings').select(WITH_PEOPLE)
  if (status) query = query.eq('status', status)
  if (handover_type) query = query.eq('handover_type', handover_type)
  if (date) {
    const [from, to] = nairobiDayRange(date)
    query = query.gte('start_at', from).lt('start_at', to)
  }
  const page = await listPage(query, { limit, cursor })
  return { ...page, data: page.data.map(toStaffSummary) }
}

/** One booking as staff see it: the customer, vehicle, full status history, documents, and payments. */
export async function getStaffBooking({ db }, id) {
  const [booking, people, events] = await Promise.all([
    getBooking({ db }, id),
    findOne(db, 'bookings', WITH_PEOPLE, id),
    db
      .from('booking_status_events')
      .select('from_status, to_status, note, created_at, actor:profiles(full_name)')
      .eq('booking_id', id)
      .order('created_at'),
  ])
  return { ...booking, customer: people.customer, vehicle: people.vehicle, events: unwrap(events) }
}

/**
 * Create a booking for a customer who is not booking online. The customer is found or created, the quote
 * is made from the fields (or an existing quote is used), and the booking has no 30-minute expiry because
 * staff manage it. An enquiry, if given, is marked converted.
 */
export async function createStaffBooking({ db, user }, input) {
  if (input.enquiry_id) await findOpenEnquiry(db, input.enquiry_id)
  const { booking, customerId } = await withServiceRole('staff_create_booking', async (admin) => {
    const customerId = await findOrCreateCustomer(admin, input.customer)
    const quoteId = input.quote_id ?? (await createQuote(input.quote)).id
    const booking = unwrap(
      await admin.rpc('create_booking_from_quote', {
        p_quote_id: quoteId,
        p_customer_id: customerId,
        p_company_id: null,
        p_actor_id: user.id,
        p_vehicle_id: input.vehicle_id ?? null,
        p_no_expiry: true,
      }),
    )
    return { booking, customerId }
  })
  if (input.enquiry_id) {
    await markEnquiryConverted(db, input.enquiry_id, {
      bookingId: booking.id,
      customerId,
      staffId: user.id,
    })
  }
  return toSummary(booking)
}

/** Move a booking to a new status as the signed-in staff member. The database enforces the rules. */
export async function changeBookingStatus({ db }, id, { to_status, note }) {
  return toSummary(
    unwrap(
      await db.rpc('staff_transition_booking', {
        p_booking_id: id,
        p_to: to_status,
        p_note: note ?? null,
      }),
    ),
  )
}

/** Put a booking on another vehicle of the same class and, for a delivery, set the driver. */
export async function assignBooking({ db }, id, { vehicle_id, driver_id }) {
  return toSummary(
    unwrap(
      await db.rpc('assign_booking', {
        p_booking_id: id,
        p_vehicle_id: vehicle_id,
        p_driver_id: driver_id ?? null,
      }),
    ),
  )
}
