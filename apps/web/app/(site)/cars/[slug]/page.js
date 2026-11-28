import { notFound, redirect } from 'next/navigation'
import { formatMoney } from '@carvo/shared'
import { TrackEvent } from '@/components/AnalyticsProvider'
import Breadcrumbs from '@/components/Breadcrumbs'
import Button from '@/components/Button'
import ClassFacts from '@/components/ClassFacts'
import ClassGrid from '@/components/ClassGrid'
import ClassPriceCard, { DATES_ID } from '@/components/ClassPriceCard'
import GoodToKnow from '@/components/GoodToKnow'
import JsonLd from '@/components/JsonLd'
import LoadError from '@/components/LoadError'
import PriceExplainer from '@/components/PriceExplainer'
import SectionHeading from '@/components/SectionHeading'
import StickySearchCta from '@/components/StickySearchCta'
import CarPhoto from '@/components/CarPhoto'
import NoPhoto from '@/components/NoPhoto'
import { copy } from '@/copy/en'
import TypeCars from '@/components/TypeCars'
import { getClassBySlug, getListedClasses, getVehicles } from '@/lib/catalogue'
import { carsOfType, withCarPhotos, listedTypes } from '@/lib/live-cars'
import { classPhoto } from '@/lib/photos'
import { pageMetadata } from '@/lib/seo'
import { breadcrumbJsonLd, productJsonLd } from '@/lib/structured-data'

const text = copy.classPage
const SIMILAR_COUNT = 3

const pathFor = (slug) => `/cars/${slug}`

const trailFor = (name, slug) => [
  { name: text.home, path: '/' },
  { name: copy.cars.title, path: '/cars' },
  { name, path: pathFor(slug) },
]

// Known car types are built ahead of time; a new one is built the first time it is asked for.
export async function generateStaticParams() {
  const list = await getListedClasses()
  return (list.data ?? []).map((item) => ({ slug: item.slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const result = await getClassBySlug(slug)
  if (!result.item)
    return { title: result.isMissing ? text.notFound : text.eyebrow, robots: { index: false } }
  const { item } = result
  const rate = item.price_per_day_kes === null ? '' : formatMoney(item.price_per_day_kes)
  return pageMetadata({
    title: text.meta.title(item.name),
    description: text.meta.description(item.name, item.seats, rate),
    path: pathFor(slug),
  })
}

function Picture({ item }) {
  const photo = classPhoto(item)
  if (photo) {
    return (
      <div className="relative aspect-[16/10] overflow-hidden rounded-panel bg-fill">
        <CarPhoto src={photo} alt={item.name} sizes="(min-width: 1024px) 55vw, 100vw" isPriority />
      </div>
    )
  }
  return (
    <div className="flex aspect-[16/10] items-center justify-center rounded-panel bg-fill">
      <NoPhoto />
    </div>
  )
}

function Overview({ item, detail }) {
  return (
    <div className="flex flex-col gap-6">
      <Picture item={item} />
      <h1 className="text-display md:text-display-lg">{item.name}</h1>
      <ClassFacts item={item} detail={detail} />
      {detail.description && (
        <p className="max-w-prose text-body text-label-2">{detail.description}</p>
      )}
    </div>
  )
}

function Similar({ items }) {
  if (items.length === 0) return null
  return (
    <section>
      <SectionHeading title={text.similarTitle} />
      <ClassGrid items={items} getHref={(other) => pathFor(other.slug)} />
    </section>
  )
}

export default async function ClassPage({ params }) {
  const { slug } = await params
  const [result, vehicles] = await Promise.all([getClassBySlug(slug), getVehicles()])
  if (result.isMissing) notFound()
  if (result.error) return <LoadError text={text} href={pathFor(slug)} />
  // A type with no car to hire has nothing to show: the renter is sent to the cars there are.
  if (listedTypes([result.item]).length === 0) redirect('/cars')
  const { detail } = result
  const cars = vehicles.data ?? []
  const [item, ...others] = withCarPhotos([result.item, ...result.others], cars)
  const description = text.meta.description(item.name, item.seats, '')
  return (
    <div className="flex flex-col gap-16 md:gap-20">
      <TrackEvent
        name="class_viewed"
        properties={{ class_id: item.id, price_per_day_kes: item.price_per_day_kes }}
      />
      <JsonLd data={breadcrumbJsonLd(trailFor(item.name, slug))} />
      <JsonLd
        data={productJsonLd({
          name: item.name,
          description: detail.description || description,
          path: pathFor(slug),
          priceKes: item.price_per_day_kes,
        })}
      />
      <section className="flex flex-col gap-6">
        <Breadcrumbs trail={trailFor(item.name, slug)} />
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-start">
          <Overview item={item} detail={detail} />
          <ClassPriceCard item={item} />
        </div>
      </section>
      <TypeCars name={item.name} cars={carsOfType(cars, slug)} />
      <GoodToKnow />
      <PriceExplainer />
      <Similar items={others.slice(0, SIMILAR_COUNT)} />
      <StickySearchCta targetId={DATES_ID} label={text.sticky} />
    </div>
  )
}
