'use client'

import { usePush } from '@/lib/use-push'
import { useState } from 'react'
import { Users } from 'lucide-react'
import DatesField from '@/components/DatesField'
import { DestinationCell, PickupCell, SelectCell } from '@/components/SearchFields'
import SearchStrip from '@/components/SearchStrip'
import { copy } from '@/copy/en'
import { buildSearchUrl, emptySearch } from '@/lib/search-url'

const text = copy.liveCars.search
const DRIVERS = [
  { value: '', label: text.anyDriver },
  { value: 'self_drive', label: text.selfDrive },
  { value: 'chauffeur_driven', label: text.chauffeur },
]

// The search the page's address describes, so changing one thing keeps the rest.
function startingValues(params) {
  const { pickup = '', dropoff = '', service = '', types, start, end, startTime, endTime } = params
  const empty = emptySearch()
  return {
    ...empty,
    pickup,
    dropoff,
    service,
    types: types ? types.split(',') : [],
    stay: {
      start: start ?? null,
      end: end ?? null,
      startTime: startTime ?? empty.stay.startTime,
      endTime: endTime ?? empty.stay.endTime,
    },
  }
}

// A search without dates opens the date picker and says why.
function useCarSearch(params) {
  const [isSearching, push] = usePush()
  const [values, setValues] = useState(() => startingValues(params))
  const [hasTriedWithoutDates, setHasTriedWithoutDates] = useState(false)
  const set = (key, value) => {
    setValues((now) => ({ ...now, [key]: value }))
    setHasTriedWithoutDates(false)
  }
  const submit = (event) => {
    event.preventDefault()
    if (!values.stay.start) return setHasTriedWithoutDates(true)
    const { gear, max, sort } = params
    push(buildSearchUrl('car_hire', values, { gear, max, sort }))
  }
  return { values, set, submit, hasTriedWithoutDates, isSearching }
}

/** Where from, where to, dates and times, and driver: the same cells as the home page's search. */
export default function CarSearchBar({ params, places }) {
  const form = useCarSearch(params)
  const { values, set } = form
  return (
    <form onSubmit={form.submit}>
      <SearchStrip
        columns={4}
        isSearching={form.isSearching}
        submitLabel={text.submit}
        className="overflow-hidden rounded-panel border border-separator bg-surface shadow-2 md:flex md:items-stretch"
      >
        <PickupCell form={form} search={{ places }} />
        <DestinationCell form={form} search={{ places }} />
        <DatesField
          stay={values.stay}
          onChange={(stay) => set('stay', { ...values.stay, ...stay })}
          error={form.hasTriedWithoutDates ? copy.search.datesRequired : ''}
        />
        <SelectCell
          icon={Users}
          label={text.driver}
          options={DRIVERS}
          value={values.service}
          onChange={(service) => set('service', service)}
        />
      </SearchStrip>
    </form>
  )
}
