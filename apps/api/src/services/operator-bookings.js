import { unwrap } from '../lib/supabase.js'
import { openFile } from './documents.js'
import { getStaffBooking, listStaffBookings } from './staff-bookings.js'

// What a rental company does with its own bookings. Each call acts as the signed-in person, and the database function
// behind it first finds the booking as theirs.

// Until a hire is agreed, the renter's phone and email stay private (product pack section 25.3).
const NOT_AGREED = ['requested', 'declined', 'expired', 'pending_payment']
const withPrivateContact = (booking) =>
  NOT_AGREED.includes(booking.status) && booking.customer
    ? { ...booking, customer: { ...booking.customer, phone: null, email: null } }
    : booking

export const getCompanyBooking = async (auth, id) =>
  withPrivateContact(await getStaffBooking(auth, id))

export async function listCompanyBookings(auth, query) {
  const page = await listStaffBookings(auth, query)
  return { ...page, data: page.data.map(withPrivateContact) }
}

/** Accept or decline a renter's request. Accepting fails if the car has since been taken for those dates. */
export async function answerRequest(auth, id, { accept, reason }) {
  unwrap(
    await auth.db.rpc('answer_request', {
      p_booking_id: id,
      p_accept: accept,
      p_reason: reason ?? null,
    }),
  )
  return getCompanyBooking(auth, id)
}

/** The booking after a move to its next status, or a cancellation with its reason. */
export async function moveBooking(auth, id, { to_status: to, note }) {
  unwrap(
    await auth.db.rpc('operator_move_booking', {
      p_booking_id: id,
      p_to: to,
      p_note: note ?? null,
    }),
  )
  return getCompanyBooking(auth, id)
}

export const listRenterDocuments = async ({ db }, id) =>
  unwrap(await db.rpc('operator_documents', { p_booking_id: id }))

/** A link to the renter's ID or licence that works for ten minutes. The database logs who asked and why first. */
export async function openRenterDocument({ db }, { bookingId, documentId, reason }) {
  const [file] = unwrap(
    await db.rpc('operator_open_document', {
      p_booking_id: bookingId,
      p_document_id: documentId,
      p_reason: reason,
    }),
  )
  return openFile(file)
}

export async function reviewRenterDocument(auth, { bookingId, documentId }, review) {
  unwrap(
    await auth.db.rpc('operator_review_document', {
      p_booking_id: bookingId,
      p_document_id: documentId,
      p_status: review.status,
      p_reason: review.rejection_reason ?? null,
    }),
  )
  return listRenterDocuments(auth, bookingId)
}

export async function recordPayment(auth, id, payment) {
  unwrap(
    await auth.db.rpc('record_handover_payment', {
      p_booking_id: id,
      p_method: payment.method,
      p_amount_kes: payment.amount_kes,
      p_reference: payment.reference ?? null,
    }),
  )
  return getCompanyBooking(auth, id)
}
