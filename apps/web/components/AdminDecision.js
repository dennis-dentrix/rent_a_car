'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import Alert from '@/components/Alert'
import Button from '@/components/Button'
import TextField from '@/components/Field'

function Answer({ name, value, variant, children }) {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      name={name}
      value={value}
      variant={variant}
      size="compact"
      isLoading={pending}
    >
      {children}
    </Button>
  )
}

/**
 * One decision about one record: a note, and a button per answer. Used for companies, documents and booking status, so
 * they all behave alike. `action` is a server action that reads `id`, the answer under `answerName`, and the note
 * under `noteName`. A refusal shows here, next to the buttons; success refreshes the list by itself.
 */
export default function AdminDecision({ action, id, answerName, noteName, noteLabel, answers }) {
  const [state, run] = useActionState(action, null)
  return (
    <form action={run} className="mt-4 flex flex-col gap-3">
      <input type="hidden" name="id" value={id} />
      {state?.error && <Alert tone="error" title={state.error} />}
      {noteName && <TextField label={noteLabel} name={noteName} />}
      <div className="flex flex-wrap gap-3">
        {answers.map((answer) => (
          <Answer
            key={answer.value}
            name={answerName}
            value={answer.value}
            variant={answer.variant}
          >
            {answer.label}
          </Answer>
        ))}
      </div>
    </form>
  )
}
