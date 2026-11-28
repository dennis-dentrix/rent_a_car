import LinkPending from '@/components/LinkPending'
import Link from 'next/link'
import { Check, SlidersHorizontal } from 'lucide-react'
import { TRANSMISSIONS } from '@carvo/shared'
import AskButton from '@/components/AskButton'
import PriceSlider from '@/components/PriceSlider'
import { copy } from '@/copy/en'
import { cx } from '@/lib/cx'
import { toggledTypes } from '@/lib/live-cars'
import { withParams } from '@/lib/query'

const text = copy.liveCars.filters
const DRIVERS = [
  { value: '', label: text.either },
  { value: 'self_drive', label: text.selfDrive },
  { value: 'chauffeur_driven', label: text.chauffeur },
]
const GEARBOXES = [
  { value: '', label: text.either },
  ...TRANSMISSIONS.map((value) => ({ value, label: copy.carFacts.transmission[value] })),
]

function Group({ title, children }) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-caption uppercase text-label-2">{title}</h3>
      {children}
    </section>
  )
}

// A row of choices where exactly one is on.
function Segments({ name, params, options }) {
  return (
    <ul className="flex gap-1 rounded-control bg-fill p-1">
      {options.map((option) => {
        const isOn = (params[name] ?? '') === option.value
        return (
          <li key={option.value || 'any'} className="flex-1">
            <Link
              href={withParams('/cars', { ...params, [name]: option.value })}
              aria-current={isOn ? 'true' : undefined}
              className={cx(
                'flex min-h-touch items-center justify-center whitespace-nowrap rounded-control px-2 text-footnote font-semibold',
                isOn ? 'bg-surface text-primary shadow-1' : 'text-label-2',
              )}
            >
              {option.label}
              <LinkPending size={14} className="ml-1" />
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

function Tick({ isOn }) {
  return (
    <span
      className={cx(
        'flex size-5 shrink-0 items-center justify-center rounded-md border',
        isOn ? 'border-primary bg-primary text-on-primary' : 'border-separator',
      )}
    >
      {isOn && <Check size={14} aria-hidden="true" />}
    </span>
  )
}

// Each car type with how many cars it has; any number may be ticked.
function Types({ cars, params }) {
  const counts = new Map()
  cars.forEach((car) => {
    if (!car.class) return
    const entry = counts.get(car.class.slug) ?? { name: car.class.name, count: 0 }
    counts.set(car.class.slug, { ...entry, count: entry.count + 1 })
  })
  const chosen = (params.types ?? '').split(',')
  return (
    <ul className="flex flex-col">
      {[...counts].map(([slug, { name, count }]) => {
        const isOn = chosen.includes(slug)
        const types = toggledTypes(params.types, slug)
        return (
          <li key={slug}>
            <Link
              href={withParams('/cars', { ...params, type: '', types })}
              aria-pressed={isOn}
              role="button"
              className="flex min-h-touch items-center gap-3 text-body"
            >
              <Tick isOn={isOn} />
              <span className="flex-1">{name}</span>
              <LinkPending size={14} />
              <span className="num rounded-pill bg-fill px-2 text-footnote text-label-2">
                {count}
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

function RailBody({ cars, params }) {
  const prices = cars.map((car) => car.daily_rate_kes).filter(Boolean)
  return (
    <div className="flex flex-col gap-6 p-5">
      <Group title={text.driver}>
        <Segments name="service" params={params} options={DRIVERS} />
      </Group>
      {new Set(prices).size > 1 && (
        <Group title={text.price}>
          <PriceSlider
            key={params.max ?? ''}
            lowest={Math.min(...prices)}
            highest={Math.max(...prices)}
            params={params}
          />
        </Group>
      )}
      <Group title={text.type}>
        <Types cars={cars} params={params} />
      </Group>
      <Group title={text.gearbox}>
        <Segments name="gear" params={params} options={GEARBOXES} />
      </Group>
    </div>
  )
}

// Reset keeps the search (place and dates) and clears the narrowing.
const cleared = ({ start, end, startTime, endTime, pickup }) =>
  withParams('/cars', { start, end, startTime, endTime, pickup })

/** The filter rail: beside the results on a wide screen, folded behind one button on a phone. */
export default function FilterRail({ cars, params }) {
  return (
    <aside aria-label={text.title} className="flex flex-col gap-4">
      <details className="group overflow-hidden rounded-panel border border-separator bg-surface shadow-1 lg:hidden">
        <summary className="flex min-h-touch cursor-pointer list-none items-center gap-2 px-5 text-headline">
          <SlidersHorizontal size={18} aria-hidden="true" />
          {text.title}
        </summary>
        <RailBody cars={cars} params={params} />
      </details>
      <div className="hidden overflow-hidden rounded-panel border border-separator bg-surface shadow-1 lg:block">
        <div className="flex items-center justify-between bg-bg-grouped px-5 py-3">
          <h2 className="flex items-center gap-2 text-headline">
            <SlidersHorizontal size={18} aria-hidden="true" />
            {text.title}
          </h2>
          <Link href={cleared(params)} className="text-footnote font-semibold text-primary">
            {text.reset}
          </Link>
        </div>
        <RailBody cars={cars} params={params} />
      </div>
      <div className="hidden rounded-panel bg-bg-grouped p-5 lg:block">
        <h2 className="text-headline">{text.helpTitle}</h2>
        <p className="mt-1 text-footnote text-label-2">{text.helpText}</p>
        <AskButton variant="tonal" className="mt-3">
          {text.helpAction}
        </AskButton>
      </div>
    </aside>
  )
}
