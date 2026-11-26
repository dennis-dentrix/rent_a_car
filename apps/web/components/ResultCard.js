import Link from 'next/link'
import { BadgeCheck, CircleCheck, MessageCircle } from 'lucide-react'
import Button from '@/components/Button'
import CarCover from '@/components/CarCover'
import ResultPrice from '@/components/ResultPrice'
import { copy } from '@/copy/en'
import { carFactList, carName } from '@/lib/car-facts'
import { carPath } from '@/lib/live-cars'
import { withParams } from '@/lib/query'

const text = copy.liveCars
const SHOWN_FACTS = ['seats', 'transmission', 'fuel_type', 'drive_type']
const PILL = 'rounded-pill bg-overlay px-3 py-1 text-caption text-label backdrop-blur'

function Photo({ car, name }) {
  return (
    <div className="relative">
      <CarCover
        car={car}
        name={name}
        sizes="(min-width: 1200px) 300px, (min-width: 768px) 50vw, 100vw"
        className="aspect-[4/3]"
      />
      <div className="absolute left-3 top-3 flex flex-wrap gap-2">
        {car.class && <span className={PILL}>{car.class.name}</span>}
        <span className={PILL}>
          {car.booking_mode === 'request' ? text.onRequest : text.instant}
        </span>
      </div>
    </div>
  )
}

// Who rents it out, what it is, and the facts a renter compares.
function About({ car, name }) {
  const facts = carFactList(car).filter((fact) => SHOWN_FACTS.includes(fact.key))
  const hired = copy.carFacts.chauffeur[car.chauffeur_option]
  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <p className="flex min-w-0 items-center gap-1 text-footnote text-label-2">
          <BadgeCheck size={14} className="shrink-0 text-verified" aria-label={text.approved} />
          <span className="truncate">{car.operator_name}</span>
        </p>
        {car.year && (
          <span className="num shrink-0 rounded-md bg-fill px-2 text-footnote text-label-2">
            {text.model(car.year)}
          </span>
        )}
      </div>
      <h2 className="text-title-2">{name}</h2>
      {car.description && (
        <p className="line-clamp-2 text-callout text-label-2">{car.description}</p>
      )}
      {facts.length > 0 && (
        <ul className="grid grid-cols-2 gap-x-3 gap-y-1 rounded-card bg-bg-grouped px-3 py-2 text-footnote">
          {facts.map((fact) => (
            <li key={fact.key}>{fact.value}</li>
          ))}
        </ul>
      )}
      {hired && (
        <p className="flex items-center gap-2 text-footnote font-semibold text-primary">
          <CircleCheck size={14} className="shrink-0" aria-hidden="true" />
          {hired}
        </p>
      )}
    </>
  )
}

// Without dates the card leads to the car, where dates are chosen and the price appears.
const bookLabel = (car, hasStay) => {
  if (!hasStay) return text.view
  return car.booking_mode === 'request' ? text.reserve : text.book
}

/** One search result: a large photo, the car, its price for the stay, and the two ways forward. */
export default function ResultCard({ car, choices }) {
  const name = carName(car, car.class?.name)
  const base = carPath(car)
  const path = base ? withParams(base, choices) : '/cars'
  const hasStay = car.total_kes !== undefined
  return (
    <li className="flex flex-col overflow-hidden rounded-panel border border-separator bg-surface shadow-1">
      <Link href={path} aria-label={text.open(name)}>
        <Photo car={car} name={name} />
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <About car={car} name={name} />
        <div className="mt-auto border-t border-separator pt-3">
          <ResultPrice car={car} />
        </div>
        <div className="flex gap-2">
          <Button
            href={withParams('/account/messages/new', { car: car.id, ...choices })}
            variant="tonal"
            aria-label={text.chat(car.operator_name)}
            className="shrink-0"
          >
            <MessageCircle size={20} aria-hidden="true" />
          </Button>
          <div className="flex-1">
            <Button href={hasStay ? withParams(`/book/${car.id}`, choices) : path} isFullWidth>
              {bookLabel(car, hasStay)}
            </Button>
          </div>
        </div>
      </div>
    </li>
  )
}
