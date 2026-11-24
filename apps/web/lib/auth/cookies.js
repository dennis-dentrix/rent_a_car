// The session lives in two cookies the browser's scripts cannot read. The access token is what the API checks;
// the refresh token asks Supabase for a new one. `store` is anything with `get`, `set`, and `delete`: the cookies
// of a server action, or of a request and response in the proxy.
export const ACCESS_COOKIE = 'rc_access'
export const REFRESH_COOKIE = 'rc_refresh'
// A plain flag the page's scripts may read, only so the header can say "Account" instead of "Sign in" without making
// every public page depend on who is looking. It holds no token and grants nothing.
export const SIGNED_IN_HINT = 'rc_in'

const THIRTY_DAYS = 60 * 60 * 24 * 30

const options = (maxAge) => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge,
})

export function writeSession(store, session) {
  // The access token's own end time decides when it stops working; the cookie only has to outlive it.
  store.set(ACCESS_COOKIE, session.access_token, options(THIRTY_DAYS))
  store.set(REFRESH_COOKIE, session.refresh_token, options(THIRTY_DAYS))
  store.set(SIGNED_IN_HINT, '1', { ...options(THIRTY_DAYS), httpOnly: false })
}

export function clearSession(store) {
  store.delete(ACCESS_COOKIE)
  store.delete(REFRESH_COOKIE)
  store.delete(SIGNED_IN_HINT)
}

export const readTokens = (store) => ({
  accessToken: store.get(ACCESS_COOKIE)?.value ?? null,
  refreshToken: store.get(REFRESH_COOKIE)?.value ?? null,
})
