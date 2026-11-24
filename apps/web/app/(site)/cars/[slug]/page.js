import { notFound } from 'next/navigation'
import { formatMoney } from '@carvo/shared'
import Breadcrumbs from '@/components/Breadcrumbs'
import Button from '@/components/Button'
import ClassFacts from '@/components/ClassFacts'
import ClassGrid from '@/components/ClassGrid'
import ClassPriceCard, { DATES_ID } from '@/components/ClassPriceCard'
import Eyebrow from '@/components/Eyebrow'
import GoodToKnow from '@/components/GoodToKnow'
import JsonLd from '@/components/JsonLd'
import LoadError from '@/components/LoadError'
import PriceExplainer from '@/components/PriceExplainer'
import StickySearchCta from '@/components/StickySearchCta'
import CarPhoto from '@/components/CarPhoto'
import VehicleArt from '@/components/VehicleArt'
import { copy } from '@/copy/en'
import { getClassBySlug, getClasses } from '@/lib/catalogue'
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
  const list = await getClasses()
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
    <div className="rounded-panel bg-stage px-6 pb-4 pt-10 md:px-12 md:pt-14">
      <VehicleArt label={item.name} styleHint={`${item.name} ${item.slug}`} className="w-full" />
    </div>
  )
}

function Overview({ item, detail }) {
  return (
    <div className="flex flex-col gap-6">
      <Picture item={item} />
      <div>
        <Eyebrow>{text.eyebrow}</Eyebrow>
        <h1 className="text-display md:text-display-lg">{item.name}</h1>
      </div>
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
      <Eyebrow>{text.similarEyebrow}</Eyebrow>
      <h2 className="mb-6 text-title-2 md:text-title-1">{text.similarTitle}</h2>
      <ClassGrid items={items} getHref={(other) => pathFor(other.slug)} />
    </section>
  )
}

export default async function ClassPage({ params }) {
  const { slug } = await params
  const result = await getClassBySlug(slug)
  if (result.isMissing) notFound()
  if (result.error) return <LoadError text={text} href={pathFor(slug)} />
  const { item, detail, others } = result
  const description = text.meta.description(item.name, item.seats, '')
  return (
    <div className="flex flex-col gap-14 md:gap-20">
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
      <GoodToKnow />
      <PriceExplainer />
      <Similar items={others.slice(0, SIMILAR_COUNT)} />
      <StickySearchCta targetId={DATES_ID} label={text.sticky} />
    </div>
  )
}
