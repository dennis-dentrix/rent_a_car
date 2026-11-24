// The web app reads data from the API only, never from the database. Server-side only.
const API_URL = process.env.API_URL ?? 'http://localhost:4000'
const TIMEOUT_MS = 5000

const toUrl = (path, query = {}) => {
  const url = new URL(`/api/v1${path}`, API_URL)
  Object.entries(query).forEach(([key, value]) => value && url.searchParams.set(key, value))
  return url
}

/** What a failed call tells the page: the error code, and the API's own message and per-field details when it sent them. */
const failure = (body) => ({
  error: body.error?.code ?? 'REQUEST_FAILED',
  message: body.error?.message,
  details: body.error?.details,
})

/**
 * One call to the API. Resolves to { data } or { error, message, details }, and never throws, so a page can show a
 * plain message when the API is slow or down.
 */
async function request(method, path, { query, token, body, cache }) {
  try {
    const response = await fetch(toUrl(path, query), {
      method,
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...(body === undefined ? {} : { 'content-type': 'application/json' }),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      ...cache,
    })
    const json = await response.json()
    return response.ok ? { data: json.data, meta: json.meta } : failure(json)
  } catch {
    return { error: 'UNREACHABLE' }
  }
}

/**
 * GET from the API. `revalidate` is in seconds; 0 means never cache (live availability). With a `token` the call is made
 * as that signed-in person, and what a signed-in person sees is never kept for anyone else.
 */
export function apiGet(path, { query = {}, revalidate = 60, token } = {}) {
  const isPrivate = revalidate === 0 || Boolean(token)
  const cache = isPrivate ? { cache: 'no-store' } : { next: { revalidate } }
  return request('GET', path, { query, token, cache })
}

/** POST, PATCH, PUT, or DELETE as a signed-in person. Never cached. */
export const apiSend = (method, path, { token, body } = {}) =>
  request(method, path, { token, body, cache: { cache: 'no-store' } })
