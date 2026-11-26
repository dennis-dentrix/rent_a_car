import { notFound } from 'next/navigation'
import Breadcrumbs from '@/components/Breadcrumbs'
import CarBookingCard, { BOOK_ID } from '@/components/CarBookingCard'
import CarGallery from '@/components/CarGallery'
import CarSpecs from '@/components/CarSpecs'
import LoadError from '@/components/LoadError'
import StickySearchCta from '@/components/StickySearchCta'
import { copy } from '@/copy/en'
import { carName } from '@/lib/car-facts'
import { getVehicle } from '@/lib/catalogue'
import { carPath } from '@/lib/live-cars'
import { pageMetadata } from '@/lib/seo'
import { stayRequest } from '@/lib/stay-query'

const text = copy.liveCars.page

const fullName = (car) => [carName(car, car.class?.name), car.year].filter(Boolean).join(' · ')

export async function generateMetadata({ params }) {
  const { carId } = await params
  const { data: car } = await getVehicle(carId)
  if (!car?.class) return { robots: { index: false } }
  const name = fullName(car)
  return pageMetadata({
    title: text.title(name, car.operator_name),
    description: text.description(name),
    path: carPath(car),
  })
}

const trailFor = (car) => [
  { name: copy.cars.crumbs.home, path: '/' },
  { name: copy.cars.title, path: '/cars' },
  { name: car.class.name, path: `/cars/${car.class.slug}` },
  { name: fullName(car), path: carPath(car) },
]

export default async function CarPage({ params, searchParams }) {
  const { slug, carId } = await params
  const query = await searchParams
  const { data: car, error } = await getVehicle(carId, stayRequest(query))
  if (error === 'NOT_FOUND' || error === 'VALIDATION_FAILED') notFound()
  if (error) return <LoadError text={text} href={`/cars/${slug}/${carId}`} />
  // A car has one address, under its own type.
  if (car.class?.slug !== slug) notFound()
  const name = fullName(car)
  return (
    <div className="flex animate-rise flex-col gap-6">
      <Breadcrumbs trail={trailFor(car)} />
      {/* On a phone the price comes right after the photos; on a wide screen it sits beside everything. */}
      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:grid-rows-[auto_1fr]">
        <div className="flex min-w-0 flex-col gap-4">
          <CarGallery paths={car.photo_paths} name={name} />
          <h1 className="text-display md:text-display-lg">{name}</h1>
        </div>
        <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <CarBookingCard car={car} query={query} />
        </div>
        <div className="flex min-w-0 flex-col gap-8">
          <CarSpecs car={car} />
        </div>
      </div>
      <StickySearchCta targetId={BOOK_ID} label={copy.booking.stay.book} />
    </div>
  )
}
