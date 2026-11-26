import { z } from 'zod'
import { BOOKING_STATUSES } from '../constants.js'
import { customerFields, isoDateTime, pageFields } from './common.js'

export const createBookingSchema = z.strictObject({
  quote_id: z.uuid(),
  customer: z.strictObject({
    ...customerFields,
    company_id: z.uuid().optional(),
    date_of_birth: z.iso.date().optional(),
  }),
  // A booking of a particular car also says where the trip is going.
  destination: z.string().trim().min(2).max(200).optional(),
  pickup_place: z.string().trim().max(200).optional(),
  // Asked only of a company that offers it: the car brought to the renter, or collected after the hire.
  wants_dropoff: z.boolean().optional(),
  wants_pickup: z.boolean().optional(),
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
