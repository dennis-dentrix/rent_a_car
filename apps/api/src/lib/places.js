import { logger } from './logger.js'

const AUTOCOMPLETE_URL = 'https://places.googleapis.com/v1/places:autocomplete'
const TIMEOUT_MS = 3000
const MAX_SUGGESTIONS = 6

const toSuggestion = ({ placePrediction: place }) => ({
  id: place.placeId,
  label: place.structuredFormat?.mainText?.text ?? place.text.text,
  detail: place.structuredFormat?.secondaryText?.text ?? '',
})

/**
 * Places in Kenya that match what the renter has typed, from Google Places. This only helps the renter fill a
 * box, so a missing key, a slow answer, or an error gives an empty list and a log line, never a failed request.
 */
export async function autocompletePlaces(text) {
  const key = process.env.GOOGLE_PLACES_API_KEY
  if (!key) return []
  try {
    const response = await fetch(AUTOCOMPLETE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': key },
      body: JSON.stringify({ input: text, includedRegionCodes: ['ke'], languageCode: 'en' }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    if (!response.ok) throw new Error(`Places answered ${response.status}`)
    const { suggestions = [] } = await response.json()
    return suggestions
      .filter((item) => item.placePrediction)
      .slice(0, MAX_SUGGESTIONS)
      .map(toSuggestion)
  } catch (error) {
    logger.warn('places_autocomplete_failed', { message: error.message })
    return []
  }
}
