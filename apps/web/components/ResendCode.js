'use client'

import { useActionState, useEffect, useState } from 'react'
import { resendCodeAction } from '@/app/auth/actions'
import Button from '@/components/Button'
import { copy } from '@/copy/en'

const text = copy.auth.verifyEmail
const COOLDOWN_SECONDS = 30

/**
 * "Send a new code", available again 30 seconds after the last one was sent (a code has just been sent when this page
 * opens). The button says why it is waiting, and the answer is read out politely, since it appears away from the button.
 */
export default function ResendCode({ email }) {
  const [secondsLeft, setSecondsLeft] = useState(COOLDOWN_SECONDS)
  const [state, run] = useActionState(async (previous, formData) => {
    const result = await resendCodeAction(previous, formData)
    if (result.status === 'sent') setSecondsLeft(COOLDOWN_SECONDS)
    return result
  }, null)

  useEffect(() => {
    const timer = setInterval(() => setSecondsLeft((left) => Math.max(0, left - 1)), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <form action={run} className="flex flex-col items-center gap-1">
      <input type="hidden" name="email" value={email} />
      <Button type="submit" variant="plain" size="compact" disabled={secondsLeft > 0}>
        {secondsLeft > 0 ? text.resendIn(secondsLeft) : text.resend}
      </Button>
      <p aria-live="polite" className="min-h-5 text-footnote text-label-2">
        {state?.error ?? (state?.status === 'sent' ? text.resent : '')}
      </p>
    </form>
  )
}
