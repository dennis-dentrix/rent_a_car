import { formatFullDate, formatTime } from '@rent-a-car/shared'

/** "Tue 24 Nov, 10:00" for a moment, in Nairobi time. */
export const momentText = (date) => `${formatFullDate(date)}, ${formatTime(date)}`

/** The customer's name, or their email or phone when they gave no name. */
export const personName = (person) => person?.full_name || person?.email || person?.phone || '—'

/** A link to the next page of a list, or null on the last page. `base` is the page's own address and its filters. */
export function nextPageHref(base, query, cursor) {
  if (!cursor) return null
  const params = new URLSearchParams({ ...query, cursor })
  return `${base}?${params}`
}
