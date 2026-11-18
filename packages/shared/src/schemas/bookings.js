import { z } from 'zod'
import { BOOKING_STATUSES } from '../constants.js'
import { customerFields, isoDateTime, pageFields } from './common.js'

export const createBookingSchema = z.strictObject({
  quote_id: z.uuid(),
  customer: z.strictObject({ ...customerFields, company_id: z.uuid().optional() }),
})

export const listBookingsQuerySchema = z.strictObject({
  status: z.enum(BOOKING_STATUSES).optional(),
  ...pageFields,
})

/** Cancel a booking. Inside the no-refund window the customer must acknowledge that no refund is due. */
export const cancelBookingSchema = z.strictObject({
  reason: z.string().trim().min(1).max(500).optional(),
  acknowledged_no_refund: z.boolean().optional(),
})

/** Move a booking to new dates. The price is worked out again from the rate table. */
export const changeDatesSchema = z
  .strictObject({ start_at: isoDateTime, end_at: isoDateTime })
  .refine((dates) => new Date(dates.end_at) > new Date(dates.start_at), {
    message: 'end_at must be after start_at.',
    path: ['end_at'],
  })
