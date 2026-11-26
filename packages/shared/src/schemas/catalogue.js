import { z } from 'zod'
import { SERVICE_IDS } from '../services.js'
import { CURRENCIES, isoDateTime, pageFields, stayFields } from './common.js'

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

const stayQuery = {
  from: isoDateTime.optional(),
  to: isoDateTime.optional(),
  with_chauffeur: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
}
const checksStay = (schema) =>
  schema
    .refine(datesTogether, { message: 'Send both from and to, or neither.' })
    .refine((query) => !query.from || new Date(query.to) > new Date(query.from), {
      message: 'to must be after from.',
      path: ['to'],
    })

/** The cars renters may see; with dates, only those free for them. */
export const vehiclesQuerySchema = checksStay(z.strictObject({ ...pageFields, ...stayQuery }))
/** One car; with dates, what the stay costs and whether it is free. */
export const vehicleQuerySchema = checksStay(z.strictObject(stayQuery))

export const availabilityQuerySchema = z.strictObject(stayFields)

/** The set of services an operator offers, replaced as a whole. Repeats are ignored. */
export const setOperatorServicesSchema = z.strictObject({
  services: z
    .array(z.enum(SERVICE_IDS))
    .max(SERVICE_IDS.length)
    .transform((list) => [...new Set(list)]),
})
