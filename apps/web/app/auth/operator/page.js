import { redirect } from 'next/navigation'
import { operatorSignUpAction } from '@/app/auth/actions'
import AuthForm from '@/components/AuthForm'
import AuthLink from '@/components/AuthLink'
import LargeTitle from '@/components/LargeTitle'
import { copy } from '@/copy/en'
import { operatorSignUpFields } from '@/lib/auth/fields'
import { homeFor } from '@/lib/auth/roles'
import { getCurrentUser } from '@/lib/auth/session'

const text = copy.auth.operatorSignUp

export const metadata = { title: text.meta.title }

// A rental company creates its account and its company together. The company is listed only after an admin approves it.
export default async function OperatorSignUpPage() {
  const user = await getCurrentUser()
  if (user)
    redirect(
      user.profile.role === 'customer' ? '/auth/operator/company' : homeFor(user.profile.role),
    )
  return (
    <>
      <LargeTitle subtitle={text.subtitle}>{text.title}</LargeTitle>
      <div className="flex flex-col gap-4">
        <AuthForm
          action={operatorSignUpAction}
          fields={operatorSignUpFields}
          submitLabel={text.submit}
        />
        <p className="text-callout text-label-2">
          {text.haveAccount}{' '}
          <AuthLink href="/auth?next=/console">{copy.auth.signUp.signIn}</AuthLink>
        </p>
        <p className="text-callout text-label-2">
          {text.forRenters} <AuthLink href="/auth/sign-up">{text.renterSignUp}</AuthLink>
        </p>
      </div>
    </>
  )
}
