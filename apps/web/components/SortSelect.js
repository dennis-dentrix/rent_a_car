'use client'

import Spinner from '@/components/Spinner'
import { usePush } from '@/lib/use-push'
import { copy } from '@/copy/en'
import { SORTS } from '@/lib/live-cars'
import { withParams } from '@/lib/query'

const text = copy.liveCars.sort

/** The order of the results, kept in the page's address. */
export default function SortSelect({ params }) {
  const [isSorting, push] = usePush()
  const change = (event) =>
    push(withParams('/cars', { ...params, sort: event.target.value }), { scroll: false })
  return (
    <label className="flex items-center gap-2 text-callout text-label-2" aria-busy={isSorting}>
      {isSorting && <Spinner />}
      {text.label}
      <select
        value={params.sort ?? SORTS[0]}
        onChange={change}
        className="min-h-touch rounded-control border border-separator bg-surface px-3 text-input font-semibold text-label md:text-callout"
      >
        {SORTS.map((value) => (
          <option key={value} value={value}>
            {text[value]}
          </option>
        ))}
      </select>
    </label>
  )
}
