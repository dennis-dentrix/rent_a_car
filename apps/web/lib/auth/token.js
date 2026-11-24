import { isSiteAddress } from '@carvo/shared'

/**
 * What the access token says about the session: when it ends, and whether a second factor was used (aal2).
 * The token was already verified by Supabase when it was issued and the API verifies it on every call, so
 * reading it here only decides when to refresh and where to send the person; it never grants anything.
 */
export function readClaims(token) {
  try {
    const { exp, aal, sub } = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString())
    return typeof exp === 'number' ? { exp, aal, sub } : null
  } catch {
    return null
  }
}

/** True when the token has ended, or will within `marginSeconds`, so a new one should be asked for first. */
export const isExpiring = (claims, now = Date.now(), marginSeconds = 60) =>
  !claims || claims.exp * 1000 - now <= marginSeconds * 1000

/**
 * Where to go after signing in: only a page on this site, never one of the sign-in pages themselves. A
 * link from another site must not be able to send someone who just signed in somewhere else.
 */
export const safeNext = (value, fallback = '/') =>
  typeof value === 'string' && isSiteAddress(value) && !/^\/auth(\/|$|\?)/.test(value)
    ? value
    : fallback

/** The request header the proxy fills with the address that was asked for. */
export const REQUESTED_PATH = 'x-requested-path'
