import { addDays } from './calendar.js'

const DAYS_OF_WEEK = 7

// Day of the week for a "YYYY-MM-DD" string: 0 is Sunday.
const weekday = (iso) => new Date(`${iso}T00:00:00Z`).getUTCDay()

/** Friday to Sunday: this coming weekend, or the current one when `today` is already Friday to Sunday. */
export function weekend(today) {
  const day = weekday(today)
  const toFriday = day === 0 ? -2 : (5 - day + DAYS_OF_WEEK) % DAYS_OF_WEEK
  const start = day === 6 ? addDays(today, -1) : addDays(today, toFriday)
  const first = start < today ? today : start
  return { start: first, end: addDays(start, 2) }
}

/** A stay of `days` days beginning tomorrow, for the "next week" and "next month" shortcuts. */
export const fromTomorrow = (today, days) => ({
  start: addDays(today, 1),
  end: addDays(today, days),
})
