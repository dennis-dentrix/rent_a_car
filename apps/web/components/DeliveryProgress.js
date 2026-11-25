import { CarFront, MapPin } from 'lucide-react'
import { copy } from '@/copy/en'
import { cx } from '@/lib/cx'

const text = copy.journey.delivery
// How far along the line the car sits for each state. Status-based: there is no tracking yet.
const PLACE = { waiting: 'translate-x-0', en_route: 'translate-x-1/2', arrived: 'translate-x-full' }

/** A car moving along a line towards the pin, in three honest positions: not left, on the way, arrived. */
export default function DeliveryProgress({ state }) {
  return (
    <div className="rounded-card bg-bg-grouped p-4">
      <div className="flex items-center gap-2" aria-hidden="true">
        <div className="relative h-8 flex-1">
          <span className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-pill bg-separator" />
          <span
            className={cx(
              'absolute inset-y-0 left-0 right-8 transition-transform duration-slow ease-slow motion-reduce:transition-none',
              PLACE[state],
            )}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-pill bg-accent text-on-accent">
              <CarFront size={18} />
            </span>
          </span>
        </div>
        <MapPin size={20} className="text-primary" />
      </div>
      <p className="mt-2 text-callout font-semibold">{text[state]}</p>
    </div>
  )
}
