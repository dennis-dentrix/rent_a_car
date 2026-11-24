'use client'

import { useFormStatus } from 'react-dom'
import Button from '@/components/Button'

/** The submit button of a form whose action is running: it says so and ignores clicks until the server answers. */
export default function SubmitButton({ children, ...rest }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" isLoading={pending} isFullWidth {...rest}>
      {children}
    </Button>
  )
}
