import { formatShortDate } from '@carvo/shared'
import { countDays } from '@/lib/calendar'

const day = (iso) => formatShortDate(`${iso}T12:00:00+03:00`)

/** "Tue 1 Dec – Fri 4 Dec", "Tue 1 Dec" for a single day, or "" when there are no dates. */
export function formatStayRange({ start, end }) {
  if (start && end && end !== start) return `${day(start)} – ${day(end)}`
  return start ? day(start) : ''
}

/**
 * The days a hire is charged for, as the server counts them: whole 24-hour periods, so returning later in the day than
 * the pickup adds one. The company's minimum can still raise it.
 */
export function hireDays({ start, end, startTime, endTime }) {
  const nights = countDays(start, end ?? start) - 1
  return Math.max(1, nights + (endTime > startTime ? 1 : 0))
}

/** A new pickup time, which the return time follows unless the renter has set it apart. */
export const pickupTimeChange = ({ startTime, endTime }, time) => ({
  startTime: time,
  ...(endTime === startTime ? { endTime: time } : {}),
})
