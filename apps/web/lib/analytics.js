import { isPrivatePath } from '@/lib/private-areas'

// The browser's share of the event dictionary in docs/analytics-events.md: each event, and the only properties it may
// carry. Events fired from the server (bookings, payments, documents) are sent by the API, not listed here. A new
// event is added to the document first, then here.
export const BROWSER_EVENTS = {
  class_viewed: ['class_id', 'price_per_day_kes'],
  search_submitted: ['class_id', 'city_slug', 'duration_days'],
  sticky_bar_cta_clicked: ['page_path'],
}

const isPlainValue = (value) =>
  ['string', 'number', 'boolean'].includes(typeof value) && value !== ''

/**
 * The event to send: its name and only the properties the dictionary allows for it, or null for an event that is
 * not in the dictionary. Nobody can send a name, a phone number, or a typed address by mistake, because a property
 * that is not listed never leaves this function.
 */
export function cleanEvent(name, properties = {}) {
  if (!Object.hasOwn(BROWSER_EVENTS, name)) return null
  const allowed = BROWSER_EVENTS[name]
  const kept = Object.entries(properties).filter(
    ([key, value]) => allowed.includes(key) && isPlainValue(value),
  )
  return { name, properties: Object.fromEntries(kept) }
}

// What the library adds to every event on its own that could carry something personal: the referring page, and the
// bags it uses to build a profile of a person. Addresses are handled separately (a search address holds what the
// visitor typed).
const AUTOMATIC_PERSONAL_PROPERTIES = ['$referrer', '$referring_domain', '$set', '$set_once']

const withoutQuery = (address) => {
  try {
    const { origin, pathname } = new URL(address)
    return `${origin}${pathname}`
  } catch {
    return undefined
  }
}

/**
 * PostHog's last step before an event is sent. An event that is not listed is dropped, the library's own automatic ones
 * included (an opt-in, a page leave, a web-vitals report). A listed event keeps its own properties and the library's
 * plain ones, with the address cut at the path and the referrer and profile bags removed. The dictionary is the only
 * way out, and a query string never goes with it.
 */
export function prepareEvent(event) {
  if (!event || !Object.hasOwn(BROWSER_EVENTS, event.event)) return null
  const properties = { ...event.properties }
  AUTOMATIC_PERSONAL_PROPERTIES.forEach((key) => delete properties[key])
  if (properties.$current_url) properties.$current_url = withoutQuery(properties.$current_url)
  return { ...event, properties }
}

/** Nothing is measured inside the private areas, whatever the visitor has agreed to. */
export const isTrackablePath = (pathname) => !isPrivatePath(pathname)

const PHONE_MAX_WIDTH = 640
const TABLET_MAX_WIDTH = 1024

/** phone, tablet, or desktop, from the window width. */
export function deviceFor(width) {
  if (width < PHONE_MAX_WIDTH) return 'phone'
  return width < TABLET_MAX_WIDTH ? 'tablet' : 'desktop'
}

/**
 * Where a visit came from, as one short label for the reports (for example `google_organic`, `direct`). It is called
 * with the `utm_source` of the address if there is one, the host name of the referring page if there is one
 * (no path, no query), and this site's own host name. A visit from the site's own pages is not a source.
 */
export function sourceFor({ utmSource, referrerHost, ownHost }) {
  // TODO(human): turn these three facts into a label. Decide how to group the visits you care about (search
  // engines, social apps, partner sites, your own pages) and what to call the rest. Keep it to a short label with
  // no personal data, and return 'direct' when there is no campaign and no referrer.
  void [utmSource, referrerHost, ownHost]
  return 'direct'
}

/** The properties sent with every event (docs/analytics-events.md §2). Never a name, contact detail, or query. */
export function commonProperties({ pathname, width, currency, isSignedIn, source }) {
  return {
    role: isSignedIn ? 'customer' : 'guest',
    device: deviceFor(width),
    locale: 'en-KE',
    display_currency: currency,
    page_path: pathname,
    source,
  }
}
