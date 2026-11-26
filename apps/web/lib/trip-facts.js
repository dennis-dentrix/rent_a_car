import { copy } from '@/copy/en'

const text = copy.trip.route
const ASKS = ['wants_dropoff', 'wants_pickup']

/** Where a booking starts and goes, and what the renter asked of the company, as list rows. For every side. */
export function tripFacts(booking) {
  const places = ['pickup_place', 'destination']
    .filter((id) => booking[id])
    .map((id) => ({ id, title: text[id], detail: booking[id] }))
  const asked = ASKS.filter((id) => booking[id]).map((id) => text[id])
  if (!asked.length) return places
  return [...places, { id: 'handover_asks', title: text.asks, detail: asked.join(' · ') }]
}
