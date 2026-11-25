import { createHash, randomInt, timingSafeEqual } from 'node:crypto'

// The code a renter reads from their email to sign on the company's screen: six digits, good for ten minutes and five
// tries. Only a hash tied to the one report is kept.
export const CODE_MINUTES = 10
export const MAX_TRIES = 5

export const newCode = () => String(randomInt(0, 1_000_000)).padStart(6, '0')

export const hashCode = (code, recordId) =>
  createHash('sha256').update(`${recordId}:${code}`).digest('hex')

/**
 * What a typed code is worth against the stored one: 'ok', 'wrong', 'expired', 'locked' (too many tries), or
 * 'missing' (none was sent).
 */
export function checkCode(stored, { code, recordId, now }) {
  if (!stored) return 'missing'
  if (new Date(stored.expires_at) <= now) return 'expired'
  if (stored.attempts >= MAX_TRIES) return 'locked'
  const given = Buffer.from(hashCode(code, recordId))
  return timingSafeEqual(given, Buffer.from(stored.code_hash)) ? 'ok' : 'wrong'
}
