// Pick-up and return times in half-hour steps, in Nairobi time ("HH:MM", 24-hour as the API expects).
const FIRST_HOUR = 6
const LAST_HOUR = 22

export const DEFAULT_PICKUP_TIME = '09:00'
// A one-day service (a transfer, a wedding) is searched from its start time to the end of that day.
export const END_OF_DAY = '23:59'

const pad = (value) => String(value).padStart(2, '0')

export const TIME_VALUES = Array.from({ length: (LAST_HOUR - FIRST_HOUR) * 2 + 1 }, (_, index) => {
  const minutes = FIRST_HOUR * 60 + index * 30
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`
})

/** "09:00" as "9:00 am", for the picker label; the stored value stays 24-hour. */
export function formatTimeLabel(value) {
  const [hours, minutes] = value.split(':').map(Number)
  const suffix = hours < 12 ? 'am' : 'pm'
  return `${hours % 12 || 12}:${pad(minutes)} ${suffix}`
}

export const TIME_OPTIONS = TIME_VALUES.map((value) => ({ value, label: formatTimeLabel(value) }))
