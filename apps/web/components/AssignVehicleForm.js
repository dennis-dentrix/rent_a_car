'use client'

import { useActionState } from 'react'
import { assignVehicleAction } from '@/app/admin/actions'
import Alert from '@/components/Alert'
import Select from '@/components/Select'
import SubmitButton from '@/components/SubmitButton'
import { copy } from '@/copy/en'

const text = copy.adminFleet.assign

/** Puts one of the fleet's cars of the booked class on a booking. `vehicles` are { id, label } already narrowed to the class. */
export default function AssignVehicleForm({ bookingId, vehicles }) {
  const [state, run] = useActionState(assignVehicleAction, null)
  if (!vehicles.length) return <p className="mt-2 text-callout text-label-2">{text.empty}</p>
  const options = [
    { value: '', label: text.none },
    ...vehicles.map((v) => ({ value: v.id, label: v.label })),
  ]
  return (
    <form action={run} className="mt-3 flex flex-col gap-3">
      <input type="hidden" name="id" value={bookingId} />
      {state?.error && <Alert tone="error" title={state.error} />}
      {state?.status === 'done' && <Alert tone="success" title={text.done} />}
      <Select label={text.label} name="vehicle_id" options={options} />
      <SubmitButton isFullWidth={false}>{text.submit}</SubmitButton>
    </form>
  )
}
