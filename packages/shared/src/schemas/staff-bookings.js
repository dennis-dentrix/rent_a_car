import { z } from 'zod'
import { BOOKING_STATUSES, NOTE_REQUIRED_STATUSES } from '../constants.js'
import { customerFields, pageFields } from './common.js'
import { quoteBodySchema } from './quotes.js'

/** A booking made by staff for a walk-in, a call, or a WhatsApp enquiry. Send a quote id or quote fields. */
export const createStaffBookingSchema = z
  .strictObject({
    enquiry_id: z.uuid().optional(),
    quote_id: z.uuid().optional(),
    quote: quoteBodySchema.optional(),
    customer: z.strictObject(customerFields),
    vehicle_id: z.uuid().optional(),
  })
  .refine((booking) => Boolean(booking.quote_id) !== Boolean(booking.quote), {
    message: 'Send either quote_id or quote, not both.',
    path: ['quote_id'],
  })

export const updateBookingStatusSchema = z
  .strictObject({
    to_status: z.enum(BOOKING_STATUSES),
    note: z.string().trim().min(1).max(500).optional(),
  })
  .refine((update) => update.note || !NOTE_REQUIRED_STATUSES.includes(update.to_status), {
    message: 'A note is required for this status.',
    path: ['note'],
  })

export const assignBookingSchema = z.strictObject({
  vehicle_id: z.uuid(),
  driver_id: z.uuid().optional(),
})

export const staffBookingsQuerySchema = z.strictObject({
  status: z.enum(BOOKING_STATUSES).optional(),
  date: z.iso.date().optional(),
  handover_type: z.enum(['office', 'delivery']).optional(),
  ...pageFields,
})
