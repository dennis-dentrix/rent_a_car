import { cache } from 'react'
import { cookies, headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { apiGet } from '@/lib/api'
import { readTokens } from '@/lib/auth/cookies'
import { needsSecondFactor } from '@/lib/auth/roles'
import { signedInClient } from '@/lib/auth/supabase'
import { REQUESTED_PATH, readClaims, safeNext } from '@/lib/auth/token'

const SIGN_IN = '/auth'
// The page that asks for the authenticator code (or sends someone to set one up).
const SECOND_STEP = '/auth/verify'

const withNext = (path, next) => `${path}?next=${encodeURIComponent(next)}`

/** The tokens in the request's cookies, and what the access token says. Null when nobody is signed in. */
export async function getTokens() {
  const tokens = readTokens(await cookies())
  const claims = tokens.accessToken ? readClaims(tokens.accessToken) : null
  return claims ? { ...tokens, claims } : null
}

/**
 * Who is signed in, from the API (which checks the token on every call): their profile, the token, and whether
 * they have used a second factor. Null when nobody is, or the session is no longer good. Asked once per page request,
 * however many parts of the page want to know, so they all get the same answer.
 */
export const getCurrentUser = cache(async () => {
  const tokens = await getTokens()
  if (!tokens) return null
  const { data } = await apiGet('/me', { token: tokens.accessToken })
  return data ? { profile: data, token: tokens.accessToken, aal: tokens.claims.aal } : null
})

/**
 * For a page that only some people may see. Sends a visitor to sign in and back again, sends staff and admin on
 * to their second factor, and shows "not found" to a signed-in person whose role is not allowed, so the page's
 * existence is not confirmed to them. `areaRoot` is where to return to after signing in when the page asked for is not known. `roles` null means any signed-in person.
 */
export async function requireRole(roles, areaRoot) {
  // A layout only knows the root of its area; the proxy knows the page that was actually asked for.
  const asked = safeNext((await headers()).get(REQUESTED_PATH), areaRoot)
  const next = asked.startsWith(areaRoot) ? asked : areaRoot
  const user = await getCurrentUser()
  if (!user) redirect(withNext(SIGN_IN, next))
  if (roles && !roles.includes(user.profile.role)) notFound()
  if (needsSecondFactor(user.profile) && user.aal !== 'aal2') redirect(withNext(SECOND_STEP, next))
  return user
}

/** Where a person goes straight after the password step: anyone who must use their authenticator goes to it. */
export const nextStep = (profile, next) =>
  needsSecondFactor(profile) ? withNext(SECOND_STEP, next) : next

/**
 * What the two second-step pages begin with: where to go afterwards, the session's tokens, and a client acting as the
 * person. Anyone who is not signed in goes to sign in; anyone who needs no second step, or has done it, goes on.
 */
export async function secondStepContext(searchParams) {
  const next = safeNext((await searchParams).next, '/')
  const user = await getCurrentUser()
  if (!user) redirect(SIGN_IN)
  if (!needsSecondFactor(user.profile) || user.aal === 'aal2') redirect(next)
  const tokens = await getTokens()
  return { next, tokens, client: await signedInClient(tokens) }
}
