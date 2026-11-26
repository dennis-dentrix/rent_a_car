'use client'

import { setHandoverAction } from '@/app/console/actions'
import Panel from '@/components/Panel'
import Switch from '@/components/Switch'
import { copy } from '@/copy/en'

const text = copy.operatorConsole.handover
const OFFERS = ['offers_dropoff', 'offers_pickup']

/** Whether the company drops cars off and picks them up. Each switch saves at once and rolls back if refused. */
export default function HandoverSwitches({ company }) {
  return (
    <Panel title={text.title}>
      <ul className="flex flex-col gap-4">
        {OFFERS.map((name) => (
          <li key={name}>
            <Switch
              label={text[name].label}
              hint={text[name].hint}
              isOn={company[name]}
              onChange={(isOn) => setHandoverAction(name, isOn)}
              failedText={text.failed}
            />
          </li>
        ))}
      </ul>
    </Panel>
  )
}
