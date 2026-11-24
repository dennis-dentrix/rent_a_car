'use client'

import posthog from 'posthog-js'
import { signOutAction } from '@/app/auth/actions'
import Button from '@/components/Button'
import { copy } from '@/copy/en'

/** The sign-out button, for any page of someone who is signed in. */
export default function SignOutForm() {
  return (
    <form
      action={signOutAction}
      onSubmit={() => {
        posthog.reset()
      }}
    >
      <Button type="submit" variant="tonal">
        {copy.auth.signOut}
      </Button>
    </form>
  )
}
