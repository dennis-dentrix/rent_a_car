/** A path with the non-empty params as a query string: withParams('/cars', { start: '2026-11-20' }). */
export function withParams(path, params) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => value && search.set(key, value))
  const text = search.toString()
  return text ? `${path}?${text}` : path
}
