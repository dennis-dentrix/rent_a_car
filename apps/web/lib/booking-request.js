import { createBookingSchema } from '@carvo/shared'
import { copy } from '@/copy/en'

const text = copy.booking.errors
const TYPED = ['full_name', 'phone', 'date_of_birth', 'destination', 'pickup_place']
const TICKED = ['wants_dropoff', 'wants_pickup']
// Stands in for the quote's id while the typed details are checked, before a quote is made.
const NO_QUOTE_YET = '00000000-0000-4000-8000-000000000000'

/** What the renter typed, to put back after a mistake. */
export const typedValues = (formData) => ({
  ...Object.fromEntries(TYPED.map((name) => [name, String(formData.get(name) ?? '').trim()])),
  ...Object.fromEntries(TICKED.map((name) => [name, formData.get(name) === 'on'])),
})

/** The booking the API takes. Every car booking needs a date of birth, a pick up location, and a destination. */
export const bookingBody = ({ values, email, quoteId }) => ({
  quote_id: quoteId,
  customer: {
    full_name: values.full_name,
    phone: values.phone,
    email,
    date_of_birth: values.date_of_birth || undefined,
  },
  destination: values.destination,
  pickup_place: values.pickup_place || undefined,
  wants_dropoff: values.wants_dropoff || undefined,
  wants_pickup: values.wants_pickup || undefined,
})

/** What is wrong with what was typed, as { field: message }, or null. */
export function bookingErrors(values, email) {
  const parsed = createBookingSchema.safeParse(
    bookingBody({ values, email, quoteId: NO_QUOTE_YET }),
  )
  const wrong = parsed.success ? [] : parsed.error.issues.map((issue) => issue.path.at(-1))
  const missing = ['date_of_birth', 'pickup_place', 'destination'].filter((name) => !values[name])
  const fields = [...new Set([...wrong, ...missing])]
  return fields.length ? Object.fromEntries(fields.map((name) => [name, text[name]])) : null
}

/** The quote for the car and stay the confirm page showed. */
export const quoteBody = (formData) => ({
  vehicle_id: formData.get('car_id'),
  start_at: formData.get('start_at'),
  end_at: formData.get('end_at'),
  ...(formData.get('with_chauffeur') ? { with_chauffeur: true } : {}),
  handover: { type: 'office' },
})

/** The plain words for a refusal from the API. */
export const refusalText = (code) => text[code] ?? text.generic
