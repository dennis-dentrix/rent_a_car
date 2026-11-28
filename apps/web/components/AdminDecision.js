'use client'

import SubmitButton from '@/components/SubmitButton'
import { useFormAction } from '@/lib/use-form-action'
import Alert from '@/components/Alert'
import TextField from '@/components/Field'

/**
 * One decision about one record: a note, and a button per answer. Used for companies, documents and booking status, so
 * they all behave alike. `action` is a server action that reads `id`, the answer under `answerName`, and the note
 * under `noteName`. A refusal shows here, next to the buttons; success refreshes the list by itself.
 */
export default function AdminDecision({ action, id, answerName, noteName, noteLabel, answers }) {
  const [state, run] = useFormAction(action, null)
  return (
    <form action={run} className="mt-4 flex flex-col gap-3">
      <input type="hidden" name="id" value={id} />
      {state?.error && <Alert tone="error" title={state.error} />}
      {noteName && <TextField label={noteLabel} name={noteName} />}
      <div className="flex flex-wrap gap-3">
        {answers.map((answer) => (
          <SubmitButton
            key={answer.value}
            name={answerName}
            value={answer.value}
            variant={answer.variant}
            size="compact"
            isFullWidth={false}
          >
            {answer.label}
          </SubmitButton>
        ))}
      </div>
    </form>
  )
}
