import { formatShortDate } from '@carvo/shared'

const day = (iso) => formatShortDate(`${iso}T12:00:00+03:00`)

/** "Tue 1 Dec – Fri 4 Dec", "Tue 1 Dec" for a single day, or "" when there are no dates. */
export function formatStayRange({ start, end }) {
  if (start && end && end !== start) return `${day(start)} – ${day(end)}`
  return start ? day(start) : ''
}
