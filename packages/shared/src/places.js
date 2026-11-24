import { z } from 'zod'

// The kinds of place the business serves. Airports and airstrips are what an airport transfer starts from.
export const LOCATION_TYPES = ['office', 'airport', 'airstrip', 'city', 'custom']
export const AIRPORT_LOCATION_TYPES = ['airport', 'airstrip']

export const isAirportType = (type) => AIRPORT_LOCATION_TYPES.includes(type)

/** What the place search takes: the text typed so far. Two letters is enough to suggest something useful. */
export const placeQuerySchema = z.object({ q: z.string().trim().min(2).max(100) })
