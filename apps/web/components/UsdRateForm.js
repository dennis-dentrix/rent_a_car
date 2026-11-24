'use client'

import { useActionState } from 'react'
import { setRateAction } from '@/app/admin/settings/actions'
import Alert from '@/components/Alert'
import SubmitButton from '@/components/SubmitButton'
import TextField from '@/components/Field'
import { copy } from '@/copy/en'

const text = copy.adminSetup.settings

/** The dollar rate for new quotes. It is a number and the day it was set for, saved together. */
export default function UsdRateForm({ rate, date }) {
  const [state, run] = useActionState(setRateAction, null)
  return (
    <form action={run} className="flex flex-col gap-3 rounded-card bg-bg-grouped p-4">
      <h2 className="text-headline">{text.rateTitle}</h2>
      <p className="text-callout text-label-2">{text.rateHint}</p>
      {state?.error && <Alert tone="error" title={state.error} />}
      {state?.status === 'saved' && <Alert tone="success" title={text.saved} />}
      <TextField
        label={text.rateLabel}
        name="rate_to_kes"
        type="number"
        step="any"
        inputMode="decimal"
        defaultValue={rate}
      />
      <TextField label={text.rateDate} name="rate_date" type="date" defaultValue={date} />
      <SubmitButton isFullWidth={false}>{text.rateSave}</SubmitButton>
    </form>
  )
}
