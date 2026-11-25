import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, CarFront } from 'lucide-react'
import ApprovedBy from '@/components/ApprovedBy'
import CarRatePrice from '@/components/CarRatePrice'
import { copy } from '@/copy/en'
import { carFactList, carName } from '@/lib/car-facts'
import { cx } from '@/lib/cx'
import { carPath } from '@/lib/live-cars'
import { mediaUrl } from '@/lib/media'

const text = copy.liveCars
const SHOWN_FACTS = ['seats', 'transmission', 'fuel_type', 'drive_type']

function Cover({ car, name }) {
  const src = mediaUrl(car.photo_paths[0], process.env.NEXT_PUBLIC_MEDIA_BASE_URL)
  return (
    <div className="relative flex aspect-[4/3] items-center justify-center bg-fill text-label-3">
      {src ? (
        <Image
          src={src}
          alt={name}
          fill
          sizes="(min-width: 1024px) 400px, (min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
      ) : (
        <span className="flex flex-col items-center gap-2 text-footnote">
          <CarFront size={32} aria-hidden="true" />
          {text.noPhoto}
        </span>
      )}
      {car.photo_paths.length > 1 && (
        <span className="num absolute bottom-3 right-3 rounded-pill bg-hero px-3 py-1 text-footnote text-on-hero">
          {text.photos(car.photo_paths.length)}
        </span>
      )}
    </div>
  )
}

function Specs({ car }) {
  const facts = carFactList(car).filter((fact) => SHOWN_FACTS.includes(fact.key))
  const hired = copy.carFacts.chauffeur[car.chauffeur_option]
  return (
    <>
      {facts.length > 0 && (
        <ul className="grid grid-cols-2 gap-x-4 gap-y-1 rounded-card bg-bg-grouped px-3 py-2 text-footnote">
          {facts.map((fact) => (
            <li key={fact.key}>{fact.value}</li>
          ))}
        </ul>
      )}
      {[hired, ...(car.features ?? []).slice(0, 3)].filter(Boolean).length > 0 && (
        <p className="text-footnote text-label-2">
          {[hired, ...(car.features ?? []).slice(0, 3)].filter(Boolean).join(' · ')}
        </p>
      )}
    </>
  )
}

function Title({ car, name }) {
  return (
    <div>
      <ApprovedBy name={car.operator_name} />
      <h3 className="text-headline">{[name, car.year].filter(Boolean).join(' · ')}</h3>
      {car.description && <p className="line-clamp-2 text-cell text-label-2">{car.description}</p>}
    </div>
  )
}

function CardAction() {
  return (
    <span className="inline-flex min-h-compact items-center gap-1 rounded-control bg-accent-subtle px-4 text-callout font-semibold text-primary">
      {text.view}
      <ArrowRight
        size={16}
        aria-hidden="true"
        className="transition-transform duration-standard group-hover:translate-x-0.5"
      />
    </span>
  )
}

const CARD =
  'group flex h-full flex-col overflow-hidden rounded-panel border border-separator bg-surface shadow-1'
const PRESSABLE =
  'transition-[border-color,transform] duration-fast hover:border-primary active:scale-[0.99]'

/** One real car: its photo, who rents it out, what it is, and the daily price. The whole card opens the car. */
export default function LiveCarCard({ car }) {
  const name = carName(car, car.class?.name)
  const path = carPath(car)
  const Wrapper = path ? Link : 'div'
  return (
    <li>
      <Wrapper href={path ?? undefined} className={cx(CARD, path && PRESSABLE)}>
        <Cover car={car} name={name} />
        <div className="flex flex-1 flex-col gap-3 p-4">
          <Title car={car} name={name} />
          <Specs car={car} />
          <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-1">
            <CarRatePrice car={car} />
            {path && <CardAction />}
          </div>
        </div>
      </Wrapper>
    </li>
  )
}
