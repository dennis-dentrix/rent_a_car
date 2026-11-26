import { z } from 'zod'
import { CURRENCIES, isoDateTime, stayFields } from './common.js'

const handoverSchema = z
  .strictObject({
    type: z.enum(['office', 'delivery']),
    address: z.string().min(3).max(300).optional(),
    delivery_zone_id: z.uuid().optional(),
    window_start: isoDateTime.optional(),
    window_end: isoDateTime.optional(),
  })
  .refine(
    (handover) =>
      handover.type === 'office' ||
      Boolean(
        handover.address &&
        handover.delivery_zone_id &&
        handover.window_start &&
        handover.window_end,
      ),
    { message: 'Delivery needs an address, a delivery zone, and a time window.' },
  )

export const quoteBodySchema = z
  .strictObject({
    ...stayFields,
    // A quote is for one car, at its own price, or for any car of a class.
    class_id: stayFields.class_id.optional(),
    vehicle_id: z.uuid().optional(),
    with_chauffeur: z.boolean().optional(),
    service: z.enum(['rental', 'airport_transfer']).default('rental'),
    handover: handoverSchema,
    pickup_location_id: z.uuid().nullable().optional(),
    extras: z.array(z.uuid()).max(10).default([]),
    currency: z.enum(CURRENCIES).default('KES'),
  })
  .refine((quote) => Boolean(quote.class_id) !== Boolean(quote.vehicle_id), {
    message: 'Send either class_id or vehicle_id, not both.',
    path: ['vehicle_id'],
  })
  .refine((quote) => !quote.with_chauffeur || quote.vehicle_id, {
    message: 'A chauffeur is chosen for a particular car.',
    path: ['with_chauffeur'],
  })
  .refine((quote) => new Date(quote.end_at) > new Date(quote.start_at), {
    message: 'end_at must be after start_at.',
    path: ['end_at'],
  })
