'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAnalytics } from '@/components/AnalyticsProvider'
import Card from '@/components/Card'
import CarTypePicker from '@/components/CarTypePicker'
import SearchStrip from '@/components/SearchStrip'
import SearchTabs from '@/components/SearchTabs'
import ServicePicker from '@/components/ServicePicker'
import { CarHireFields, EventFields, FIELD_COUNTS, TransferFields } from '@/components/SearchFields'
import { copy } from '@/copy/en'
import { buildSearchUrl, emptySearch, hasSearchDate } from '@/lib/search-url'
import { hireDays } from '@/lib/stay-range'

const FIELDS = { car_hire: CarHireFields, transfers: TransferFields, events: EventFields }

// The choices, and what happens on submit. Searching without the date the service needs shows why
// instead of listing every car as if it were free.
function useSearchForm({ initialGroup, initialService }) {
  const router = useRouter()
  const { track } = useAnalytics()
  const [group, setGroup] = useState(initialGroup)
  const [values, setValues] = useState(() => ({ ...emptySearch(), service: initialService }))
  const [hasTriedWithoutDate, setHasTriedWithoutDate] = useState(false)

  const set = (key, value) => {
    setValues((now) => ({ ...now, [key]: value }))
    setHasTriedWithoutDate(false)
  }
  const chooseGroup = (next) => {
    setGroup(next)
    set('service', '')
  }
  const submit = (event) => {
    event.preventDefault()
    if (!hasSearchDate(group, values)) return setHasTriedWithoutDate(true)
    track('search_submitted', {
      duration_days: group === 'car_hire' ? hireDays(values.stay) : undefined,
    })
    router.push(buildSearchUrl(group, values))
  }
  return { group, chooseGroup, values, set, submit, hasTriedWithoutDate }
}

// The message under the date cell after a search without the date the service needs.
const dateError = (group, hasTried) => {
  if (!hasTried) return ''
  return group === 'car_hire' ? copy.search.datesRequired : copy.search.dateRequired
}

function SubmitLabel({ group, stay }) {
  if (group === 'car_hire' && stay.start) {
    return copy.search.submitDays(hireDays(stay))
  }
  return copy.search.submit
}

/**
 * The search card: service tabs, the services within the tab, and a labelled strip whose fields suit the
 * service. It sends the choices to /cars as an address, so a search can be shared and bookmarked.
 */
export default function HeroSearch({ search, initialGroup = 'car_hire', initialService = '' }) {
  const form = useSearchForm({ initialGroup, initialService })
  const Fields = FIELDS[form.group]
  const error = dateError(form.group, form.hasTriedWithoutDate)
  return (
    <Card hasPadding={false} className="flex flex-col overflow-hidden shadow-2">
      {/* On a phone the main fields come straight after the tabs, and the two narrowing choices sit under them. */}
      <div className="contents md:flex md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-3 md:border-b md:border-separator md:px-6 md:py-3">
        <div className="border-b border-separator px-2 py-2 md:border-0 md:p-0">
          <SearchTabs value={form.group} onChange={form.chooseGroup} />
        </div>
        <div className="order-last flex flex-wrap items-center gap-2 border-t border-separator px-gutter py-3 md:order-none md:border-0 md:p-0">
          <ServicePicker
            group={form.group}
            value={form.values.service}
            onChange={(value) => form.set('service', value)}
          />
          <CarTypePicker
            options={search.carTypes}
            value={form.values.types}
            onChange={(value) => form.set('types', value)}
          />
        </div>
      </div>
      <form onSubmit={form.submit} className="flex flex-col gap-4 md:p-6">
        <SearchStrip
          columns={FIELD_COUNTS[form.group]}
          submitLabel={<SubmitLabel group={form.group} stay={form.values.stay} />}
          className="overflow-hidden bg-surface md:flex md:items-stretch md:rounded-card md:border md:border-separator"
        >
          <Fields form={form} search={search} error={error} />
        </SearchStrip>
      </form>
    </Card>
  )
}
