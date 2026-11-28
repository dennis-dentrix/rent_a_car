import SubmitButton from '@/components/SubmitButton'
import { signOutAction } from '@/app/auth/actions'
import { copy } from '@/copy/en'

/** The sign-out button, for any page of someone who is signed in. */
export default function SignOutForm({ size }) {
  return (
    <form action={signOutAction}>
      <SubmitButton variant="tonal" size={size} isFullWidth={false}>
        {copy.auth.signOut}
      </SubmitButton>
    </form>
  )
}
