'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { useAnalytics } from '@/components/AnalyticsProvider'
import Button from '@/components/Button'
import Card from '@/components/Card'
import CarTypePicker from '@/components/CarTypePicker'
import SearchTabs from '@/components/SearchTabs'
import ServicePicker from '@/components/ServicePicker'
import { CarHireFields, EventFields, FIELD_COUNTS, TransferFields } from '@/components/SearchFields'
import { copy } from '@/copy/en'
import { countDays } from '@/lib/calendar'
import { buildSearchUrl, emptySearch, hasSearchDate } from '@/lib/search-url'

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
    const { start, end } = values.stay
    track('search_submitted', {
      duration_days: group === 'car_hire' ? countDays(start, end ?? start) : undefined,
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
    return copy.search.submitDays(countDays(stay.start, stay.end ?? stay.start))
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
    <Card hasPadding={false} className="overflow-hidden shadow-2">
      <div className="flex flex-col gap-3 border-b border-separator px-4 py-3 md:flex-row md:items-center md:justify-between md:px-6">
        <SearchTabs value={form.group} onChange={form.chooseGroup} />
        <div className="flex flex-wrap items-center gap-2">
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
      <form onSubmit={form.submit} className="flex flex-col gap-4 p-4 md:p-6">
        <div className="overflow-hidden rounded-card border border-separator bg-surface md:flex md:items-stretch">
          <div
            style={{ '--cols': FIELD_COUNTS[form.group] }}
            className="grid gap-px bg-separator md:flex-1 md:grid-cols-2 lg:grid-cols-[repeat(var(--cols),minmax(0,1fr))]"
          >
            <Fields form={form} search={search} error={error} />
          </div>
          <div className="bg-surface p-2 md:flex md:shrink-0 md:p-1.5">
            <Button type="submit" isFullWidth className="md:h-full md:px-8">
              <Search size={20} aria-hidden="true" />
              <SubmitLabel group={form.group} stay={form.values.stay} />
            </Button>
          </div>
        </div>
      </form>
    </Card>
  )
}
