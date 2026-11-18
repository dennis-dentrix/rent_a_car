// Times are stored in UTC and displayed in Africa/Nairobi, only in display code.
export const NAIROBI = 'Africa/Nairobi'

const format = (date, options) =>
  new Intl.DateTimeFormat('en-KE', { timeZone: NAIROBI, ...options }).format(new Date(date))

/** "Tue 10 Nov" */
export const formatShortDate = (date) =>
  format(date, { weekday: 'short', day: 'numeric', month: 'short' }).replace(',', '')

/** "10 November 2026" for documents */
export const formatFullDate = (date) =>
  format(date, { day: 'numeric', month: 'long', year: 'numeric' })

/** "14:30" in Nairobi */
export const formatTime = (date) =>
  format(date, { hour: '2-digit', minute: '2-digit', hour12: false })

/** "2026-11-20", the calendar date in Nairobi. Used to pick the rate that applies. */
export const nairobiDate = (date) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: NAIROBI }).format(new Date(date))

export const toUtcIso = (date) => new Date(date).toISOString()

export const isBefore = (a, b) => new Date(a).getTime() < new Date(b).getTime()

/** The UTC start (inclusive) and end (exclusive) of a Nairobi calendar day, as ISO strings. */
export const nairobiDayRange = (date) => {
  const start = new Date(`${date}T00:00:00+03:00`)
  return [start.toISOString(), new Date(start.getTime() + 24 * 60 * 60 * 1000).toISOString()]
}
