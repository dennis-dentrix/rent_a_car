import { formatMoney } from '@carvo/shared'
import CarRate from '@/components/CarRate'
import Fact from '@/components/Fact'
import Panel from '@/components/Panel'
import { copy } from '@/copy/en'
import { carFactList } from '@/lib/car-facts'

const text = copy.adminFleet.vehicle

function Details({ vehicle }) {
  const facts = carFactList(vehicle)
  return (
    <Panel title={text.detailsTitle}>
      {facts.length === 0 && <p className="text-cell text-label-2">{text.noDetails}</p>}
      <dl className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {facts.map((fact) => (
          <Fact key={fact.key} label={fact.label} value={fact.value} />
        ))}
      </dl>
      {vehicle.description && <p className="mt-4 text-cell">{vehicle.description}</p>}
      <ul className="mt-4 flex flex-wrap gap-2 empty:hidden">
        {(vehicle.features ?? []).map((feature) => (
          <li key={feature} className="rounded-pill bg-bg-grouped px-3 py-1 text-footnote">
            {feature}
          </li>
        ))}
      </ul>
    </Panel>
  )
}

const money = (amount) => (amount ? formatMoney(amount) : null)

function Pricing({ vehicle, car, fallback }) {
  const hired = copy.carFacts.chauffeur[vehicle.chauffeur_option]
  return (
    <Panel title={text.pricingTitle} hint={text.pricingNote}>
      <div className="mb-4 rounded-control bg-bg-grouped p-3">
        <CarRate car={car} value={vehicle.daily_rate_kes} fallback={fallback} />
      </div>
      <dl className="grid grid-cols-2 gap-4">
        <Fact
          label={text.chauffeurRate}
          value={money(vehicle.chauffeur_daily_kes) ?? text.notSet}
        />
        {hired && (
          <Fact label={copy.adminFleet.resources.vehicles.fields.chauffeur_option} value={hired} />
        )}
      </dl>
    </Panel>
  )
}

function Records({ vehicle }) {
  return (
    <Panel title={text.recordsTitle}>
      <dl className="grid grid-cols-2 gap-4">
        <Fact label={text.chassis} value={vehicle.chassis_number} />
        <Fact
          label={text.mileage}
          value={vehicle.mileage_km?.toLocaleString('en-KE') ?? text.notSet}
        />
        <Fact label={text.owner} value={vehicle.owner?.full_name ?? text.ownerNone} />
      </dl>
    </Panel>
  )
}

/** Everything known about one car: what renters see, what it costs, and the company's own records. */
export default function VehicleFacts({ vehicle, car, fallback }) {
  return (
    <>
      <Details vehicle={vehicle} />
      <div className="grid items-start gap-5 md:grid-cols-2">
        <Pricing vehicle={vehicle} car={car} fallback={fallback} />
        <Records vehicle={vehicle} />
      </div>
    </>
  )
}
