'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { reviewOperatorAction } from '@/app/admin/operators/actions'
import Alert from '@/components/Alert'
import Button from '@/components/Button'
import TextField from '@/components/Field'
import { copy } from '@/copy/en'

const text = copy.auth.adminOperators

function Answer({ to, variant, children }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" name="to" value={to} variant={variant} size="compact" isLoading={pending}>
      {children}
    </Button>
  )
}

/** Approve a company, or reject it with a reason. The list updates by itself once the answer is saved. */
export default function OperatorReview({ id }) {
  const [state, run] = useActionState(reviewOperatorAction, null)
  return (
    <form action={run} className="mt-4 flex flex-col gap-3">
      <input type="hidden" name="id" value={id} />
      {state?.error && <Alert tone="error" title={state.error} />}
      <TextField label={text.reasonLabel} name="reason" />
      <div className="flex flex-wrap gap-3">
        <Answer to="approved" variant="primary">
          {text.approve}
        </Answer>
        <Answer to="rejected" variant="destructive">
          {text.reject}
        </Answer>
      </div>
    </form>
  )
}
