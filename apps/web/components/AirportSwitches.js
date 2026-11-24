'use client'

import { setAirportServedAction } from '@/app/console/actions'
import Switch from '@/components/Switch'
import { copy } from '@/copy/en'

const text = copy.operatorConsole.places

const GROUPS = [
  { type: 'airport', title: text.international },
  { type: 'airstrip', title: text.airstrips },
]

/**
 * Every airport and airstrip as a switch. Each moves at once and goes back, with a message, if the server will not keep
 * it, so the screen never says "served" for something that was not saved.
 */
export default function AirportSwitches({ airports }) {
  return (
    <div className="flex flex-col gap-6">
      {GROUPS.map(({ type, title }) => (
        <section key={type} className="flex flex-col gap-3">
          <h3 className="text-headline">{title}</h3>
          <ul className="flex flex-col gap-4 rounded-card bg-bg-grouped p-4">
            {airports
              .filter((place) => place.type === type)
              .map((place) => (
                <li key={place.id}>
                  <Switch
                    label={place.name}
                    hint={place.address}
                    isOn={place.is_served}
                    onChange={(next) => setAirportServedAction(place.id, next)}
                    failedText={text.failed}
                  />
                </li>
              ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
