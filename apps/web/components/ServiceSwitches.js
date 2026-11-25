'use client'

import { useRef } from 'react'
import { SERVICE_GROUPS } from '@carvo/shared'
import { setServicesAction } from '@/app/console/actions'
import Panel from '@/components/Panel'
import Switch from '@/components/Switch'
import { copy } from '@/copy/en'

const text = copy.operatorConsole.services

/** The services a company offers, grouped as renters see them. Each switch saves the whole set and rolls back if refused. */
export default function ServiceSwitches({ selected }) {
  const chosen = useRef(new Set(selected))
  const change = (id) => async (isOn) => {
    const next = new Set(chosen.current)
    if (isOn) next.add(id)
    else next.delete(id)
    const isKept = await setServicesAction([...next])
    if (isKept) chosen.current = next
    return isKept
  }
  return (
    <div className="grid items-start gap-5 lg:grid-cols-3">
      {Object.entries(SERVICE_GROUPS).map(([group, ids]) => (
        <Panel key={group} title={copy.services.groups[group].label}>
          <ul className="flex flex-col gap-4">
            {ids.map((id) => (
              <li key={id}>
                <Switch
                  label={copy.services.items[id]}
                  isOn={selected.includes(id)}
                  onChange={change(id)}
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
