import { signOutAction } from '@/app/auth/actions'
import Button from '@/components/Button'
import { copy } from '@/copy/en'

/** The sign-out button, for any page of someone who is signed in. */
export default function SignOutForm({ size }) {
  return (
    <form action={signOutAction}>
      <Button type="submit" variant="tonal" size={size}>
        {copy.auth.signOut}
      </Button>
    </form>
  )
}
