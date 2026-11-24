import { nairobiDayBounds } from '@rent-a-car/shared'
import Alert from '@/components/Alert'
import Button from '@/components/Button'
import Chip from '@/components/Chip'
import ClassGrid from '@/components/ClassGrid'
import EmptyState from '@/components/EmptyState'
import LargeTitle from '@/components/LargeTitle'
import { copy } from '@/copy/en'
import { getClasses } from '@/lib/catalogue'
import { pageMetadata } from '@/lib/seo'
import { withParams } from '@/lib/query'
import { breadcrumbJsonLd } from '@/lib/structured-data'
import JsonLd from '@/components/JsonLd'
import ServiceFilter from '@/components/ServiceFilter'
import { END_OF_DAY, TIME_VALUES } from '@/lib/stay-times'
import { formatStayRange } from '@/lib/stay-range'
import { Car } from 'lucide-react'

// A search with dates or filters is a variation of the main page: it points at /cars and is kept out of the index.
export async function generateMetadata({ searchParams }) {
  const hasFilters = Object.values(await searchParams).some(Boolean)
  return pageMetadata({ ...copy.cars.meta, path: '/cars', isIndexable: !hasFilters })
}

const DAY = /^\d{4}-\d{2}-\d{2}$/

// Only well-formed days reach the API; anything else is ignored rather than sent on.
function readStay({ start, end, startTime, endTime }) {
  if (!DAY.test(start ?? '') || !DAY.test(end ?? '') || end < start) return {}
  const times = {
    startTime: TIME_VALUES.includes(startTime) ? startTime : undefined,
    endTime: [...TIME_VALUES, END_OF_DAY].includes(endTime) ? endTime : undefined,
  }
  const { from, to } = nairobiDayBounds(start, end, times)
  return { start, end, from, to, ...times }
}

function Filters({ tags, params }) {
  return (
    <nav
      aria-label={copy.cars.filtersLabel}
      className="glass sticky top-header z-stickyBar -mx-4 mb-5 overflow-x-auto border-b border-separator px-4 py-3 md:top-header-wide md:mx-0 md:rounded-card md:border md:px-4"
    >
      <ul className="flex gap-2">
        {['', ...tags].map((tag) => (
          <li key={tag || 'all'}>
            <Chip
              label={tag || copy.cars.all}
              isSelected={(params.tag ?? '') === tag}
              href={withParams('/cars', { ...params, tag, class: '' })}
            />
          </li>
        ))}
      </ul>
    </nav>
  )
}

// A name search: the text appears in the car type's name or in what it suits.
const matchesText = (item, text) =>
  `${item.name} ${item.slug} ${item.best_for.join(' ')}`
    .toLowerCase()
    .includes(text.trim().toLowerCase())

function Results({ items, params }) {
  const tags = [...new Set(items.flatMap((item) => item.best_for))]
  const byTag = params.tag ? items.filter((item) => item.best_for.includes(params.tag)) : items
  const byClass = params.class ? byTag.filter((item) => item.slug === params.class) : byTag
  const wanted = params.types ? params.types.split(',') : []
  const byType = wanted.length ? byClass.filter((item) => wanted.includes(item.slug)) : byClass
  const shown = params.q ? byType.filter((item) => matchesText(item, params.q)) : byType
  return (
    <>
      {tags.length > 0 && <Filters tags={tags} params={params} />}
      {shown.length > 0 ? (
        <ClassGrid items={shown} getHref={(item) => `/cars/${item.slug}`} />
      ) : (
        <EmptyState
          icon={Car}
          title={copy.cars.emptyTitle}
          message={copy.cars.emptyText}
          action={
            <Button href={withParams('/cars', { ...params, tag: '', class: '' })} variant="tonal">
              {copy.cars.clear}
            </Button>
          }
        />
      )}
    </>
  )
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
})

const pageSubtitle = (text, stay) => {
  if (text) return copy.cars.forQuery(text)
  return stay.start ? copy.cars.forDates(formatStayRange(stay)) : copy.cars.subtitle
}

export default async function CarsPage({ searchParams }) {
  const query = await searchParams
  const stay = readStay(query)
  const result = await getClasses({ from: stay.from, to: stay.to })
  const params = paramsFrom(query, stay)
  const subtitle = pageSubtitle(query.q, stay)
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(CRUMBS)} />
      <LargeTitle subtitle={subtitle}>{copy.cars.title}</LargeTitle>
      <ServiceFilter params={params} />
      {result.error ? (
        <LoadError params={params} />
      ) : (
        <Results items={result.data} params={params} />
      )}
    </>
  )
}
