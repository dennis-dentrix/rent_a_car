import { useActionState } from 'react'
import { attempt } from '@/lib/attempt'
import { copy } from '@/copy/en'

// What was typed, to put back after a submit that never arrived. Passwords and codes are never put back.
const typed = (formData) =>
  Object.fromEntries([...formData].filter(([name]) => !/password|code|token/.test(name)))

/** `useActionState` for a server action: if the submit does not get through, the form says so and keeps its words. */
export const useFormAction = (action, initial = null) =>
  useActionState(
    (previous, formData) =>
      attempt(() => action(previous, formData), {
        error: copy.errors.offline,
        values: typed(formData),
      }),
    initial,
  )
