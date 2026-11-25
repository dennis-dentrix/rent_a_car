import { TRANSMISSIONS } from '@carvo/shared'
import Chip from '@/components/Chip'
import LiveCarCard from '@/components/LiveCarCard'
import { copy } from '@/copy/en'
import { filterCars } from '@/lib/live-cars'
import { withParams } from '@/lib/query'

const text = copy.liveCars

function ChoiceRow({ name, params, options }) {
  return (
    <ul className="flex gap-2 overflow-x-auto">
      {options.map((option) => (
        <li key={option.value || 'any'}>
          <Chip
            label={option.label}
            isSelected={(params[name] ?? '') === option.value}
            href={withParams('/cars', { ...params, [name]: option.value })}
          />
        </li>
      ))}
    </ul>
  )
}

const typeOptions = (cars) => [
  { value: '', label: text.allTypes },
  ...[
    ...new Map(cars.filter((car) => car.class).map((car) => [car.class.slug, car.class.name])),
  ].map(([value, label]) => ({ value, label })),
]

const GEARBOXES = [
  { value: '', label: text.anyGearbox },
  ...TRANSMISSIONS.map((value) => ({ value, label: copy.carFacts.transmission[value] })),
]

/** The real cars on Carvo, filtered by type and gearbox from the page's address. Nothing is shown until there is one. */
export default function LiveCars({ cars, params }) {
  if (!cars.length) return null
  const shown = filterCars(cars, params)
  return (
    <section aria-labelledby="live-cars" className="mb-10 flex flex-col gap-4">
      <div className="flex items-baseline gap-3">
        <h2 id="live-cars" className="text-title-2">
          {text.title}
        </h2>
        <p className="text-footnote text-label-2">{text.count(shown.length)}</p>
      </div>
      <ChoiceRow name="type" params={params} options={typeOptions(cars)} />
      <ChoiceRow name="gear" params={params} options={GEARBOXES} />
      {shown.length === 0 && <p className="text-body text-label-2">{text.none}</p>}
      <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {shown.map((car) => (
          <LiveCarCard key={car.id} car={car} />
        ))}
      </ul>
    </section>
  )
}
