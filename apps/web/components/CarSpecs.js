import { Briefcase, Check, Cog, Fuel, Gauge, Palette, Route, Users } from 'lucide-react'
import { copy } from '@/copy/en'
import { carFactList } from '@/lib/car-facts'

const text = copy.liveCars.page

const ICONS = {
  seats: Users,
  luggage_capacity: Briefcase,
  transmission: Cog,
  fuel_type: Fuel,
  drive_type: Route,
  engine_cc: Gauge,
  colour: Palette,
}

function Spec({ fact }) {
  const Icon = ICONS[fact.key]
  return (
    <li className="flex items-center gap-3 rounded-card border border-separator bg-surface p-3">
      <Icon size={20} className="shrink-0 text-primary" aria-hidden="true" />
      <span className="min-w-0">
        <span className="block text-footnote text-label-2">{fact.label}</span>
        <span className="block text-headline">{fact.value}</span>
      </span>
    </li>
  )
}

function Group({ title, children }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-title-2">{title}</h2>
      {children}
    </section>
  )
}

/** What one car is and has. A part the company left empty is not shown. */
export default function CarSpecs({ car }) {
  const facts = carFactList(car)
  return (
    <>
      {car.description && (
        <Group title={text.about}>
          <p className="max-w-prose text-reading text-label-2">{car.description}</p>
        </Group>
      )}
      {facts.length > 0 && (
        <Group title={text.specs}>
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {facts.map((fact) => (
              <Spec key={fact.key} fact={fact} />
            ))}
          </ul>
        </Group>
      )}
      {car.features.length > 0 && (
        <Group title={text.features}>
          <ul className="grid gap-2 md:grid-cols-2">
            {car.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-body">
                <Check size={16} className="shrink-0 text-success" aria-hidden="true" />
                {feature}
              </li>
            ))}
          </ul>
        </Group>
      )}
    </>
  )
}
