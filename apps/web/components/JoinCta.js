'use client'

import Button from '@/components/Button'
import { areaFor } from '@/lib/areas'
import { useWho } from '@/lib/use-who'

/**
 * The main call to action on the rental companies page. Someone who already has a company, or runs the platform, is
 * not asked to create one: they are taken to their dashboard. Everyone else sees `createLabel`.
 */
export function JoinButton({ createLabel, variant }) {
  const { who } = useWho()
  const area = who && areaFor(who.role)
  return (
    <Button href={area ? area.href : '/auth/operator'} variant={variant}>
      {area ? area.cta : createLabel}
    </Button>
  )
}

/** "Sign in" for a visitor. Someone already signed in has no use for it, so it is not drawn. */
export function SignInButton({ label, variant }) {
  const { who, hasHint } = useWho()
  if (who || hasHint) return null
  return (
    <Button href="/auth/company" variant={variant}>
      {label}
    </Button>
  )
}
