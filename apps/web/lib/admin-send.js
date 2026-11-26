import { cookies } from 'next/headers'
import { copy } from '@/copy/en'
import { apiSend } from '@/lib/api'
import { readTokens } from '@/lib/auth/cookies'

const REFUSALS = [
  'VALIDATION_FAILED',
  'CONFLICT',
  'FORBIDDEN',
  'DOCUMENTS_NOT_VERIFIED',
  'INSPECTION_REQUIRED',
  'BOOKING_OVERLAP',
  'INVALID_STATUS_TRANSITION',
]

/**
 * One change made by the signed-in admin. Resolves to { ok: true } or { error }, where the error is the API's own
 * plain sentence when it refused the change for a reason the admin can act on, and a general one otherwise. `fields`
 * is the API's own per-field list of what was wrong, when it gave one.
 */
export async function adminSend(method, path, body) {
  const token = readTokens(await cookies()).accessToken
  const result = await apiSend(method, path, { token, body })
  if (!result.error) return { ok: true, data: result.data }
  const message = REFUSALS.includes(result.error) ? result.message : null
  return { error: message || copy.admin.bookings.errors.generic, fields: result.details }
}
