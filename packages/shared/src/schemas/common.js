import { z } from 'zod'
import { DEFAULT_LIMIT, DOCUMENT_CONTENT_TYPES, MAX_FILE_BYTES, MAX_LIMIT } from '../constants.js'

// Building blocks shared by more than one endpoint schema.
export const CURRENCIES = ['KES', 'USD']

export const isoDateTime = z.iso.datetime({ offset: true })

/** The three fields that identify a stay: which class, and from when to when. */
export const stayFields = {
  class_id: z.uuid(),
  start_at: isoDateTime,
  end_at: isoDateTime,
}

const E164_PHONE = /^\+[1-9]\d{7,14}$/

// People type numbers with spaces, dashes, dots, and brackets, or write 00 for the plus sign.
const tidyPhone = (value) => value.replace(/[\s\-().]/g, '').replace(/^00/, '+')

/**
 * A phone number with its country code, from any country: +254712345678, +44 20 7946 0958, +1 (415) 555-0132.
 * Spaces and dashes are removed. A number without a country code is refused, because we cannot tell the country.
 */
export const e164Phone = z
  .string()
  .trim()
  .transform(tidyPhone)
  .pipe(z.string().regex(E164_PHONE, 'Include the country code, for example +44 20 7946 0958.'))

/** The details every booking needs about the customer. */
export const customerFields = {
  full_name: z.string().trim().min(2).max(120),
  phone: e164Phone,
  email: z.email(),
}

/** For `.refine(...hasAtLeastOneField)` on an update schema where every field is optional. */
export const hasAtLeastOneField = [
  (value) => Object.keys(value).length > 0,
  { message: 'Send at least one field.' },
]

/** What the browser says it is about to upload. The signed link only accepts exactly this. */
export const fileDeclaration = {
  content_type: z.enum(DOCUMENT_CONTENT_TYPES),
  size_bytes: z.number().int().min(1).max(MAX_FILE_BYTES),
}

/** The `limit` and `cursor` query fields every list endpoint takes. */
export const pageFields = {
  limit: z.coerce.number().int().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
  cursor: z.string().min(1).optional(),
}
