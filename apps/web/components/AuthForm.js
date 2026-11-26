'use client'

import { useActionState, useEffect, useEffectEvent, useRef } from 'react'
import Alert from '@/components/Alert'
import HiddenFields from '@/components/HiddenFields'
import TextField from '@/components/Field'
import PasswordField from '@/components/PasswordField'
import SubmitButton from '@/components/SubmitButton'

// The six-digit code: large and spaced out, sent by itself when the last digit goes in.
const CODE_LENGTH = 6
const codeProps = {
  autoFocus: true,
  className: 'text-center text-title-2 tracking-[0.4em]',
  onChange: (event) => {
    const { form, value } = event.target
    if (value.replace(/\s/g, '').length === CODE_LENGTH) form.requestSubmit()
  },
}

function FieldList({ fields, state, initial }) {
  return fields.map(({ type, isCode, ...field }) => {
    const Field = type === 'password' ? PasswordField : TextField
    return (
      <Field
        key={field.name}
        {...(type === 'password' ? {} : { type })}
        {...(isCode ? codeProps : {})}
        defaultValue={state?.values?.[field.name] ?? initial[field.name]}
        error={state?.errors?.[field.name]}
        required
        {...field}
      />
    )
  })
}

/** What follows each answer: focus on the first thing to fix, and the caller told once when something was saved. */
function useAnswerEffects(state, formRef, onSaved) {
  // Runs once per answer, however often the caller draws the form again with a new function.
  const handleSaved = useEffectEvent(() => onSaved?.())
  useEffect(() => {
    if (state?.status === 'saved') handleSaved()
  }, [state])
  // After a refused submit, take the person to the first thing to fix, so the error is seen, not hunted for.
  useEffect(() => {
    if (state?.errors) formRef.current?.querySelector('[aria-invalid=true]')?.focus()
  }, [state, formRef])
}

/**
 * One form for every step of signing in and for the Settings page. `fields` say what to ask (see lib/auth/fields.js),
 * `hidden` are values to send along (where to go next), and `action` is the server action that checks them. It answers
 * with { error } for the whole form, { errors } for single fields, { values } to put back what was typed (never a
 * password), { status: 'sent' }, which swaps the form for `sent` (a message about an email on its way), or
 * { status: 'saved' }, which keeps the form and shows `saved` under it. `initial` is what the fields start with;
 * `onSaved` runs after a save.
 */
export default function AuthForm({
  action,
  fields,
  hidden = {},
  submitLabel,
  sent,
  initial = {},
  saved,
  onSaved,
  children,
}) {
  const [state, run] = useActionState(action, null)
  const formRef = useRef(null)
  useAnswerEffects(state, formRef, onSaved)
  if (state?.status === 'sent' && sent) {
    return (
      <Alert tone="success" title={sent.title}>
        {sent.text}
      </Alert>
    )
  }
  return (
    <form ref={formRef} action={run} className="flex flex-col gap-4">
      <HiddenFields values={hidden} />
      {state?.error && <Alert tone="error" title={state.error} />}
      <FieldList fields={fields} state={state} initial={initial} />
      {children}
      <SubmitButton>{submitLabel}</SubmitButton>
      {saved && state?.status === 'saved' && (
        <p role="status" className="text-callout text-success">
          {saved}
        </p>
      )}
    </form>
  )
}
