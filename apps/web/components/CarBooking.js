'use client'

import { useState, useTransition } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Button from '@/components/Button'
import CarRatePrice from '@/components/CarRatePrice'
import DatesField from '@/components/DatesField'
import SegmentedControl from '@/components/SegmentedControl'
import { copy } from '@/copy/en'
import { withParams } from '@/lib/query'
import { emptySearch } from '@/lib/search-url'
import { carriedChoices, wantsChauffeur } from '@/lib/stay-query'

const text = copy.booking.stay
const DRIVERS = [
  { value: 'self_drive', label: text.selfDrive },
  { value: 'chauffeur_driven', label: text.chauffeur },
]

const stayFrom = ({ start, end, startTime, endTime }) => {
  const { stay } = emptySearch()
  return {
    start: start ?? null,
    end: end ?? null,
    startTime: startTime ?? stay.startTime,
    endTime: endTime ?? stay.endTime,
  }
}

// Every choice goes into the page's address, and the server answers with the price for it.
function useCarStay(query) {
  const router = useRouter()
  const path = usePathname()
  const [isPricing, startPricing] = useTransition()
  const [stay, setStay] = useState(() => stayFrom(query))
  const price = (next, service = query.service) => {
    const dates = next.start ? { ...next, end: next.end ?? next.start } : {}
    const choices = { ...dates, service, pickup: query.pickup, dropoff: query.dropoff }
    startPricing(() => router.replace(withParams(path, choices), { scroll: false }))
  }
  return { stay, setStay, price, isPricing }
}

// What can be done with the chosen dates: book, or be told why not. Without dates the button asks for them.
function NextStep({ car, query, onNeedDates }) {
  const label = car.booking_mode === 'request' ? text.reserve : text.book
  if (car.is_free === undefined) {
    return (
      <Button isFullWidth onClick={onNeedDates}>
        {label}
      </Button>
    )
  }
  if (!car.is_free) return <p className="text-body text-error">{text.taken}</p>
  if (car.total_kes === undefined) return <p className="text-body text-error">{text.notOffered}</p>
  return (
    <Button href={withParams(`/book/${car.id}`, carriedChoices(query))} isFullWidth>
      {label}
    </Button>
  )
}

function DriverChoice({ car, query, onChange }) {
  if (car.chauffeur_option !== 'both') {
    const only = copy.carFacts.chauffeur[car.chauffeur_option]
    return only ? <p className="text-callout text-label-2">{only}</p> : null
  }
  return (
    <SegmentedControl
      label={text.driver}
      options={DRIVERS}
      value={wantsChauffeur(query) ? 'chauffeur_driven' : 'self_drive'}
      onChange={onChange}
    />
  )
}

/** The dates and driver for one car, its price for them as the server works it out, and the button to book. */
export default function CarBooking({ car, query }) {
  const { stay, setStay, price, isPricing } = useCarStay(query)
  const [needsDates, setNeedsDates] = useState(false)
  const change = (part) => {
    const next = { ...stay, ...part }
    setStay(next)
    setNeedsDates(false)
    if (part.start === null) price(next)
  }
  return (
    <div className="flex flex-col gap-3">
      <div aria-live="polite" aria-busy={isPricing} className={isPricing ? 'opacity-50' : ''}>
        <CarRatePrice car={car} hasChauffeur={wantsChauffeur(query)} />
      </div>
      <div className="overflow-hidden rounded-card border border-separator">
        <DatesField
          stay={stay}
          onChange={change}
          onDone={() => price(stay)}
          error={needsDates ? text.needDates : ''}
        />
      </div>
      <DriverChoice car={car} query={query} onChange={(service) => price(stay, service)} />
      {isPricing ? (
        <Button isFullWidth disabled>
          {text.pricing}
        </Button>
      ) : (
        <NextStep car={car} query={query} onNeedDates={() => setNeedsDates(true)} />
      )}
      <p className="text-center text-footnote text-label-2">
        {car.booking_mode === 'request' ? text.requestNote : text.payLater}
      </p>
    </div>
  )
}
