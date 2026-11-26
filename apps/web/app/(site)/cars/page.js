import Alert from '@/components/Alert'
import Button from '@/components/Button'
import LargeTitle from '@/components/LargeTitle'
import { copy } from '@/copy/en'
import { getSearchOptions, getVehicles } from '@/lib/catalogue'
import { pageMetadata } from '@/lib/seo'
import { withParams } from '@/lib/query'
import { breadcrumbJsonLd } from '@/lib/structured-data'
import JsonLd from '@/components/JsonLd'
import LiveCars from '@/components/LiveCars'
import SearchSummary from '@/components/SearchSummary'
import { readStay, stayRequest } from '@/lib/stay-query'

// A search with dates or filters is a variation of the main page: it points at /cars and is kept out of the index.
export async function generateMetadata({ searchParams }) {
  const hasFilters = Object.values(await searchParams).some(Boolean)
  return pageMetadata({ ...copy.cars.meta, path: '/cars', isIndexable: !hasFilters })
}

const CRUMBS = [
  { name: copy.cars.crumbs.home, path: '/' },
  { name: copy.cars.title, path: '/cars' },
]

function LoadError({ params }) {
  return (
    <Alert
      tone="error"
      title={copy.cars.errorTitle}
      action={
        <Button href={withParams('/cars', params)} variant="tonal" size="compact">
          {copy.cars.retry}
        </Button>
      }
    >
      {copy.cars.errorText}
    </Alert>
  )
}

// The address keeps every choice, so a filter link or a retry never loses the dates.
const paramsFrom = (query, stay) => ({
  start: stay.start,
  end: stay.end,
  startTime: stay.startTime,
  endTime: stay.endTime,
  pickup: query.pickup,
  dropoff: query.dropoff,
  place: query.place,
  passengers: query.passengers,
  cars: query.cars,
  service: query.service,
  types: query.types,
  q: query.q,
  tag: query.tag,
  class: query.class,
  type: query.type,
  gear: query.gear,
  max: query.max,
  sort: query.sort,
})

// With dates, the search line under the title already says what was asked for.
const pageSubtitle = (text, stay) => {
  if (text) return copy.cars.forQuery(text)
  return stay.start ? undefined : copy.cars.subtitle
}

export default async function CarsPage({ searchParams }) {
  const query = await searchParams
  const stay = readStay(query)
  const [{ data, error }, { places }] = await Promise.all([
    getVehicles(stayRequest(query)),
    getSearchOptions(),
  ])
  const params = paramsFrom(query, stay)
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(CRUMBS)} />
      <LargeTitle subtitle={pageSubtitle(query.q, stay)}>{copy.cars.title}</LargeTitle>
      <div className="flex flex-col gap-8">
        <SearchSummary params={params} places={places} />
        {error ? <LoadError params={params} /> : <LiveCars cars={data} params={params} />}
      </div>
    </>
  )
}
