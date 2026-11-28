import { isAirportType } from '@carvo/shared'
import { apiGet } from '@/lib/api'
import { listedTypes, shownTypes } from '@/lib/live-cars'
import { classPhoto } from '@/lib/photos'

// Classes and locations change rarely and are cached; a list with dates carries live availability and is not.
export const getClasses = (query = {}) =>
  apiGet('/classes', { query, revalidate: query.from ? 0 : 60 })

// Only the photos are used, so a minute-old copy does no harm. Prices and availability are always read fresh.
const getCarPhotos = () => apiGet('/vehicles', { query: { limit: 100 }, revalidate: 60 })

/** The car types renters are offered, with pictures. Names of any type, listed or not, come from `getClasses`. */
export async function getListedClasses() {
  const [types, cars] = await Promise.all([getClasses(), getCarPhotos()])
  return types.data ? { ...types, data: shownTypes(types.data, cars.data) } : types
}

// Real cars carry a price, so they are read fresh.
/** The cars renters may see; with `from` and `to`, only the free ones, each with its total. */
export const getVehicles = (stay = {}) =>
  apiGet('/vehicles', { query: { limit: 100, ...stay }, revalidate: 0 })

/** One car; with `from` and `to`, also what the stay costs and whether the car is free for it. */
export const getVehicle = (id, stay = {}) =>
  apiGet(`/vehicles/${encodeURIComponent(id)}`, { query: stay, revalidate: 0 })

export const getLocations = () => apiGet('/locations', { revalidate: 3600 })

// Display rates for the currency switch. If this fails, only KES is offered.
export const getRates = () => apiGet('/exchange-rates', { revalidate: 3600 })

const toOption = (value, label) => ({ value, label })

/**
 * What the search form offers, from the cached lists: our own places, the airports and airstrips for an airport
 * transfer, and the car types to choose from. Each list is empty if the API did not answer.
 */
export async function getSearchOptions() {
  const [locations, classes] = await Promise.all([getLocations(), getListedClasses()])
  const all = locations.data ?? []
  const options = (items) => items.map((place) => toOption(place.name, place.name))
  return {
    places: options(all.filter((place) => !isAirportType(place.type))),
    airports: options(all.filter((place) => isAirportType(place.type))),
    carTypes: (classes.data ?? []).map((item) => ({
      ...toOption(item.slug, item.name),
      photo: classPhoto(item),
    })),
  }
}

/**
 * One car type by its address name, with its detail and the other car types for "similar" links. Resolves to
 * { item, detail, others }, { isMissing: true } when no such car type exists, or { error } when the API fails.
 */
export async function getClassBySlug(slug) {
  const list = await getClasses()
  if (list.error) return { error: list.error }
  const item = list.data.find((candidate) => candidate.slug === slug)
  if (!item) return { isMissing: true }
  const detail = await apiGet(`/classes/${item.id}`, { revalidate: 60 })
  if (detail.error) return { error: detail.error }
  const others = listedTypes(list.data).filter((other) => other.id !== item.id)
  return { item, detail: detail.data, others }
}
