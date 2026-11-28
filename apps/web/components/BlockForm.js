'use client'

import { useFormAction } from '@/lib/use-form-action'
import FieldPair from '@/components/FieldPair'
import { blockDatesAction } from '@/app/console/calendar-actions'
import Alert from '@/components/Alert'
import TextField from '@/components/Field'
import Select from '@/components/Select'
import SubmitButton from '@/components/SubmitButton'
import { copy } from '@/copy/en'

const text = copy.calendar

/** Blocks one car for some days. `cars` are { value, label }. */
export default function BlockForm({ cars }) {
  const [state, run] = useFormAction(blockDatesAction, null)
  return (
    <form key={state?.sentAt} action={run} className="flex flex-col gap-3">
      {state?.error && <Alert tone="error" title={state.error} />}
      <Select label={text.car} name="vehicle_id" options={cars} />
      <FieldPair>
        <TextField label={text.first} name="start_date" type="date" required />
        <TextField label={text.last} name="end_date" type="date" required />
      </FieldPair>
      <TextField label={text.note} name="note" maxLength={200} />
      <SubmitButton>{text.block}</SubmitButton>
    </form>
  )
}
