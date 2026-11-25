'use client'

import { useState, useTransition } from 'react'
import { sendRenterCodeAction } from '@/app/inspections/actions'
import Button from '@/components/Button'
import TextField from '@/components/Field'
import { copy } from '@/copy/en'

const text = copy.inspections.sign

/** Emails the renter their code, says where it went, and takes it back. */
export default function RenterCode({ id }) {
  const [outcome, setOutcome] = useState(null)
  const [isSending, startSending] = useTransition()
  const send = () => startSending(async () => setOutcome(await sendRenterCodeAction(id)))
  return (
    <div className="flex flex-col gap-3">
      <Button type="button" variant="tonal" size="compact" onClick={send} isLoading={isSending}>
        {text.sendCode}
      </Button>
      <p role="status" className="text-footnote text-label-2 empty:hidden">
        {outcome?.data && text.codeSent(outcome.data.sent_to, outcome.data.minutes)}
      </p>
      {outcome?.error && <p className="text-footnote text-error">{outcome.error}</p>}
      <TextField
        label={text.code}
        name="code"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]{6}"
        maxLength={6}
        required
      />
    </div>
  )
}
