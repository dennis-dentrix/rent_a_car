import { Pencil } from 'lucide-react'
import CarSearchBar from '@/components/CarSearchBar'
import { copy } from '@/copy/en'
import { hireDays, formatStayRange } from '@/lib/stay-range'
import { DEFAULT_PICKUP_TIME } from '@/lib/stay-times'

const text = copy.liveCars.search

const driverText = (service) =>
  ({ self_drive: text.selfDrive, chauffeur_driven: text.chauffeur })[service]

const days = ({ start, end, startTime = DEFAULT_PICKUP_TIME, endTime = startTime }) =>
  copy.search.days(hireDays({ start, end, startTime, endTime }))

/**
 * Once dates are chosen the search folds to one line saying what was asked for, which opens to change it. Before
 * that the whole search bar is shown.
 */
export default function SearchSummary({ params, places }) {
  if (!params.start) return <CarSearchBar params={params} places={places} />
  const route = [params.pickup, params.dropoff].filter(Boolean).join(' → ')
  const parts = [route, formatStayRange(params), driverText(params.service)]
  return (
    <details>
      <summary className="inline-flex min-h-touch cursor-pointer list-none flex-wrap items-center gap-3 rounded-pill border border-separator bg-surface px-5 py-2 text-callout shadow-1">
        <span className="font-semibold">{parts.filter(Boolean).join(' · ')}</span>
        <span className="num rounded-pill bg-accent-subtle px-2 text-footnote font-semibold text-primary">
          {days(params)}
        </span>
        <span className="inline-flex items-center gap-1 text-primary">
          <Pencil size={14} aria-hidden="true" />
          {text.change}
        </span>
      </summary>
      <div className="mt-3">
        <CarSearchBar params={params} places={places} />
      </div>
    </details>
  )
}
