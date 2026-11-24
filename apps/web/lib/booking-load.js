import { adminGet, orNotFound } from '@/lib/admin'

/**
 * One booking and the class names its page shows, fetched together. `error` is set when the booking could not be loaded;
 * a booking that does not exist shows the not-found page.
 */
export async function loadBooking(apiPath, token, getClassNames) {
  const [found, classNames] = await Promise.all([adminGet(apiPath, token), getClassNames()])
  const { data, error } = orNotFound(found)
  return { booking: data, error, classNames }
}
