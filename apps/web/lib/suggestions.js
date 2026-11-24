import { SERVICE_GROUPS } from '@carvo/shared'
import { copy } from '@/copy/en'
import { withParams } from '@/lib/query'

export const SUGGESTION_KINDS = ['service', 'car', 'place']

/**
 * What the header search can offer, as a flat list: each service, each car type, each pick-up place. Every
 * item has a kind, a label to show and match, and the /cars address it leads to.
 */
export function buildSuggestions({ classes = [], locations = [] }) {
  const services = Object.values(SERVICE_GROUPS)
    .flat()
    .map((id) => ({
      kind: 'service',
      label: copy.services.items[id],
      href: withParams('/cars', { service: id }),
    }))
  const cars = classes.map((item) => ({
    kind: 'car',
    label: item.name,
    detail: item.best_for.join(', '),
    href: `/cars/${item.slug}`,
  }))
  const places = locations.map((place) => ({
    kind: 'place',
    label: place.name,
    href: withParams('/cars', { pickup: place.slug }),
  }))
  return [...services, ...cars, ...places]
}

const matches = (item, text) => `${item.label} ${item.detail ?? ''}`.toLowerCase().includes(text)

/** The suggestions containing the typed text, most useful first (a label that starts with it), up to `limit`. */
export function filterSuggestions(items, typed, limit = 8) {
  const text = typed.trim().toLowerCase()
  if (!text) return []
  const found = items.filter((item) => matches(item, text))
  const starts = found.filter((item) => item.label.toLowerCase().startsWith(text))
  return [...starts, ...found.filter((item) => !starts.includes(item))].slice(0, limit)
}

/** Free text that matches nothing on the list is searched by name on /cars. */
export const textSearchHref = (typed) => withParams('/cars', { q: typed.trim() })
