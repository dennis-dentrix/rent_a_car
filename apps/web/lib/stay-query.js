import { nairobiDayBounds } from '@carvo/shared'
import { END_OF_DAY, TIME_VALUES } from '@/lib/stay-times'

const DAY = /^\d{4}-\d{2}-\d{2}$/

/**
 * The dates in a page's address, with the instants the API takes. Only well-formed days are used; anything else is
 * ignored rather than sent on.
 */
export function readStay({ start, end, startTime, endTime }) {
  if (!DAY.test(start ?? '') || !DAY.test(end ?? '') || end < start) return {}
  const times = {
    startTime: TIME_VALUES.includes(startTime) ? startTime : undefined,
    endTime: [...TIME_VALUES, END_OF_DAY].includes(endTime) ? endTime : undefined,
  }
  const { from, to } = nairobiDayBounds(start, end, times)
  return { start, end, from, to, ...times }
}

export const wantsChauffeur = ({ service }) => service === 'chauffeur_driven'

/** What the API is asked for the stay in a page's address: nothing without dates. */
export function stayRequest(query) {
  const { from, to } = readStay(query)
  if (!from) return {}
  return { from, to, ...(wantsChauffeur(query) ? { with_chauffeur: 'true' } : {}) }
}

const CARRIED = ['start', 'end', 'startTime', 'endTime', 'service', 'pickup', 'dropoff']

/** The choices a renter keeps from the search to the car page and on to booking, so none is asked twice. */
export const carriedChoices = (query) => Object.fromEntries(CARRIED.map((key) => [key, query[key]]))
