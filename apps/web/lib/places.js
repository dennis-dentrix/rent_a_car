const TIMEOUT_MS = 4000

/** One suggestion as the box shows it and the form keeps it: the name, then the area after a comma. */
export const placeText = ({ label, detail }) => (detail ? `${label}, ${detail}` : label)

/** Our own places that contain the typed text (all of them, when nothing is typed), as suggestions. */
export const matchKnownPlaces = (known, text) => {
  const typed = text.trim().toLowerCase()
  return known
    .filter((place) => place.label.toLowerCase().includes(typed))
    .map((place) => ({ id: `known-${place.value}`, label: place.label, detail: '', isKnown: true }))
}

/** Our places first, then the map service's, without showing the same name twice. */
export function mergePlaces(known, remote) {
  const seen = new Set(known.map((place) => place.label.toLowerCase()))
  return [...known, ...remote.filter((place) => !seen.has(place.label.toLowerCase()))]
}

/**
 * Places in Kenya that match the text, from the API. Resolves to a list, and an empty one when the API is slow,
 * down, or the request was cancelled: the renter can always keep what they typed.
 */
export async function fetchPlaces(text, signal) {
  try {
    const url = `/api/v1/places/autocomplete?q=${encodeURIComponent(text)}`
    const response = await fetch(url, {
      signal: AbortSignal.any([signal, AbortSignal.timeout(TIMEOUT_MS)]),
    })
    if (!response.ok) return []
    return (await response.json()).data ?? []
  } catch {
    return []
  }
}
