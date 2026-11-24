import { z } from 'zod'
import { SERVICE_IDS } from '../services.js'
import { CURRENCIES, isoDateTime, stayFields } from './common.js'

const datesTogether = (value) => Boolean(value.from) === Boolean(value.to)

export const classesQuerySchema = z
  .strictObject({
    city: z.string().min(1).optional(),
    service: z.enum(SERVICE_IDS).optional(),
    from: isoDateTime.optional(),
    to: isoDateTime.optional(),
    currency: z.enum(CURRENCIES).default('KES'),
  })
  .refine(datesTogether, { message: 'Send both from and to, or neither.' })

export const availabilityQuerySchema = z.strictObject(stayFields)

/** The set of services an operator offers, replaced as a whole. Repeats are ignored. */
export const setOperatorServicesSchema = z.strictObject({
  services: z
    .array(z.enum(SERVICE_IDS))
    .max(SERVICE_IDS.length)
    .transform((list) => [...new Set(list)]),
})
