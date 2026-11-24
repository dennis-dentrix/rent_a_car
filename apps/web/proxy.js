import { NextResponse } from 'next/server'
import { clearSession, readTokens, writeSession } from '@/lib/auth/cookies'
import { anonAuthClient } from '@/lib/auth/supabase'
import { REQUESTED_PATH, isExpiring, readClaims } from '@/lib/auth/token'
import { CURRENCY_COOKIE, currencyCookie, defaultCurrencyForCountry } from '@/lib/currency'

// Supabase says a refresh token is no good with one of these. Anything else (a network failure) may pass.
const REFUSED = [400, 401, 403]

/**
 * A new session when the access token is about to end and a refresh token is held; `null` when Supabase refuses
 * the refresh token (the session is over); undefined when nothing needs doing. A server component cannot set a
 * cookie, so this is where the session is renewed, once per page request, before the page is drawn.
 */
async function renewedSession(request) {
  const { accessToken, refreshToken } = readTokens(request.cookies)
  if (!refreshToken || !isExpiring(accessToken ? readClaims(accessToken) : null)) return undefined
  const { data, error } = await anonAuthClient().auth.refreshSession({
    refresh_token: refreshToken,
  })
  if (!error) return data.session
  return REFUSED.includes(error.status) ? null : undefined
}

// Every page: keep the session fresh. First visit only: remember a starting display currency from the country
// Cloudflare reports. After that the visitor's own choice (the currency switch) is what the cookie holds.
export async function proxy(request) {
  // Tells a page which address was asked for, so a layout that sends a visitor to sign in can bring them back to it.
  request.headers.set(REQUESTED_PATH, request.nextUrl.pathname + request.nextUrl.search)
  const renewed = await renewedSession(request)
  if (renewed) writeSession(request.cookies, renewed)
  if (renewed === null) clearSession(request.cookies)
  const response = NextResponse.next({ request })
  if (renewed) writeSession(response.cookies, renewed)
  if (renewed === null) clearSession(response.cookies)
  if (!request.cookies.has(CURRENCY_COOKIE)) {
    const country = request.headers.get('cf-ipcountry') ?? undefined
    response.headers.append('set-cookie', currencyCookie(defaultCurrencyForCountry(country)))
  }
  return response
}

// Pages only: not static files, Next's own assets, or the API.
export const config = { matcher: ['/((?!_next|api|.*\\..*).*)'] }
