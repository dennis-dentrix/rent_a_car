'use client'

import { useFormStatus } from 'react-dom'
import Button from '@/components/Button'

/**
 * The submit button of a form whose action is running: it shows it is working and ignores clicks until the server
 * answers. Where one form has several buttons (`name` and `value`), only the pressed one spins and the rest wait.
 */
export default function SubmitButton({ children, disabled = false, ...rest }) {
  const { pending, data } = useFormStatus()
  const isPressed = pending && (!rest.name || data?.get(rest.name) === rest.value)
  return (
    <Button
      type="submit"
      isLoading={isPressed}
      disabled={disabled || pending}
      isFullWidth
      {...rest}
    >
      {children}
    </Button>
  )
}
