'use client'

import { useFormAction } from '@/lib/use-form-action'
import { HANDOVER_PAYMENT_METHODS } from '@carvo/shared'
import { recordPaymentAction } from '@/app/console/hire-actions'
import Alert from '@/components/Alert'
import TextField from '@/components/Field'
import Select from '@/components/Select'
import SubmitButton from '@/components/SubmitButton'
import { copy } from '@/copy/en'

const text = copy.hire.payment
const METHODS = HANDOVER_PAYMENT_METHODS.map((value) => ({ value, label: text.methods[value] }))

/** One payment received: how much, how, and its reference. It starts at what is still owed. */
export default function PaymentForm({ bookingId, owed }) {
  const [state, run] = useFormAction(recordPaymentAction, null)
  return (
    <form action={run} className="flex flex-col gap-3">
      <input type="hidden" name="id" value={bookingId} />
      {state?.error && <Alert tone="error" title={state.error} />}
      <TextField
        label={text.amount}
        name="amount_kes"
        type="number"
        inputMode="numeric"
        min="1"
        max={owed}
        defaultValue={owed}
        required
      />
      <Select label={text.method} name="method" options={METHODS} />
      <TextField label={text.reference} name="reference" />
      <SubmitButton>{text.record}</SubmitButton>
    </form>
  )
}
