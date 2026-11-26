'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { apiSend } from '@/lib/api'
import { readTokens } from '@/lib/auth/cookies'
import { getCurrentUser } from '@/lib/auth/session'
import {
  bookingBody,
  bookingErrors,
  quoteBody,
  refusalText,
  typedValues,
} from '@/lib/booking-request'

// The price is worked out again by the server. If it differs from the one shown, nothing is booked.
async function freshQuote(formData) {
  const { data, error } = await apiSend('POST', '/quotes', { body: quoteBody(formData) })
  if (error) return { error: refusalText(error) }
  if (data.total_kes === Number(formData.get('total'))) return { quoteId: data.id }
  revalidatePath(`/book/${formData.get('car_id')}`)
  return { error: refusalText('priceChanged') }
}

/** Books the car and goes to the new trip's page, or answers with what to fix. */
export async function bookCarAction(_state, formData) {
  const user = await getCurrentUser()
  if (!user) redirect('/auth')
  const values = typedValues(formData)
  const { email } = user.profile
  const errors = bookingErrors(values, email)
  if (errors) return { errors, values }
  const quote = await freshQuote(formData)
  if (quote.error) return { error: quote.error, values }
  const token = readTokens(await cookies()).accessToken
  const body = bookingBody({ values, email, quoteId: quote.quoteId })
  const { data, error } = await apiSend('POST', '/bookings', { token, body })
  if (error) return { error: refusalText(error), values }
  redirect(`/account/bookings/${data.id}`)
}

/** Tells the server the renter has seen this booking, so its news is cleared. */
export async function markBookingSeenAction(id) {
  const token = readTokens(await cookies()).accessToken
  await apiSend('POST', `/bookings/${encodeURIComponent(id)}/seen`, { token })
}
