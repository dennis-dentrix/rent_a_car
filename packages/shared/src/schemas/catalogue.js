import { z } from 'zod'
import { CURRENCIES, isoDateTime, stayFields } from './common.js'

const datesTogether = (value) => Boolean(value.from) === Boolean(value.to)

export const classesQuerySchema = z
  .strictObject({
    city: z.string().min(1).optional(),
    from: isoDateTime.optional(),
    to: isoDateTime.optional(),
    currency: z.enum(CURRENCIES).default('KES'),
  })
  .refine(datesTogether, { message: 'Send both from and to, or neither.' })

export const availabilityQuerySchema = z.strictObject(stayFields)
