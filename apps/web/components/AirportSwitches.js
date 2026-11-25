'use client'

import { setAirportServedAction } from '@/app/console/actions'
import Panel from '@/components/Panel'
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
    <div className="flex flex-col gap-5">
      {GROUPS.map(({ type, title }) => (
        <Panel key={type} title={title}>
          <ul className="grid gap-x-10 gap-y-4 md:grid-cols-2">
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
        </Panel>
      ))}
    </div>
  )
}
