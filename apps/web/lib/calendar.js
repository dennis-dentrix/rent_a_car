// Calendar days are plain "YYYY-MM-DD" strings, so there is no time zone to get wrong.
const DAY_MS = 24 * 60 * 60 * 1000

const toMs = (iso) => Date.parse(`${iso}T00:00:00Z`)
const toIso = (ms) => new Date(ms).toISOString().slice(0, 10)

export const addDays = (iso, days) => toIso(toMs(iso) + days * DAY_MS)

/** Inclusive count of days in a range: the same day twice is one day. */
export const countDays = (start, end) => (toMs(end) - toMs(start)) / DAY_MS + 1

/** Weeks (Monday first) of a month; days outside the month are null. `month` is 0 to 11. */
export function monthGrid(year, month) {
  const lead = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7
  const length = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
  const days = Array.from({ length }, (_, i) => toIso(Date.UTC(year, month, i + 1)))
  const cells = [...Array(lead).fill(null), ...days]
  while (cells.length % 7 !== 0) cells.push(null)
  return Array.from({ length: cells.length / 7 }, (_, week) => cells.slice(week * 7, week * 7 + 7))
}

export const isBlocked = (iso, blockedRanges) =>
  blockedRanges.some(([from, to]) => iso >= from && iso <= to)

const crossesBlocked = (start, end, blockedRanges) =>
  blockedRanges.some(([from, to]) => from <= end && to >= start)

/** The range after a tap: the first tap sets the start, the second sets the end. A tap that would
 *  start before the start, or cross a blocked day, begins a new range instead. */
export function pickDay({ start, end }, picked, blockedRanges = []) {
  if (!start || end || picked < start) return { start: picked, end: null }
  if (crossesBlocked(start, picked, blockedRanges)) return { start: picked, end: null }
  return { start, end: picked }
}

/** One tapped day as a one-day range, for a service that happens on a single day. */
export const pickSingleDay = (picked) => ({ start: picked, end: picked })
