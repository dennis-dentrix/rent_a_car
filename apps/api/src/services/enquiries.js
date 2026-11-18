import { AppError } from '../lib/errors.js'
import { listPage } from '../lib/pagination.js'
import { withServiceRole } from '../lib/supabase.js'
import { findOne, insertOne, updateOne } from './records.js'

const ENQUIRY_COLUMNS =
  'id, source, name, phone, email, message, class_id, vehicle_id, start_at, end_at, ' +
  'customer_id, converted_booking_id, handled_by, created_at'

/** A visitor's enquiry. Visitors cannot read or write the table, so it is saved with the service role. */
export const createPublicEnquiry = (input) =>
  withServiceRole('create_enquiry', (admin) =>
    insertOne(admin, 'enquiries', 'id', { ...input, source: 'form' }),
  )

/** An enquiry staff log from a WhatsApp message or a call. */
export const createStaffEnquiry = ({ db, user }, input) =>
  insertOne(db, 'enquiries', ENQUIRY_COLUMNS, { ...input, handled_by: user.id })

export function listEnquiries({ db }, { status, limit, cursor }) {
  const query = db.from('enquiries').select(ENQUIRY_COLUMNS)
  if (status === 'open') return listPage(query.is('converted_booking_id', null), { limit, cursor })
  if (status === 'converted') {
    return listPage(query.not('converted_booking_id', 'is', null), { limit, cursor })
  }
  return listPage(query, { limit, cursor })
}

/** An enquiry that exists and has not been turned into a booking yet. */
export async function findOpenEnquiry(db, id) {
  const enquiry = await findOne(db, 'enquiries', 'id, converted_booking_id', id)
  if (enquiry.converted_booking_id) {
    throw new AppError('CONFLICT', { message: 'That enquiry already became a booking.' })
  }
  return enquiry
}

export const markEnquiryConverted = (db, id, { bookingId, customerId, staffId }) =>
  updateOne(db, 'enquiries', 'id', id, {
    converted_booking_id: bookingId,
    customer_id: customerId,
    handled_by: staffId,
  })
