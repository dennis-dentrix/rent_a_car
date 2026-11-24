import { redirect } from 'next/navigation'
import { signUpAction } from '@/app/auth/actions'
import AuthForm from '@/components/AuthForm'
import AuthLink from '@/components/AuthLink'
import LargeTitle from '@/components/LargeTitle'
import { copy } from '@/copy/en'
import { signUpFields } from '@/lib/auth/fields'
import { homeFor } from '@/lib/auth/roles'
import { getCurrentUser } from '@/lib/auth/session'
import { safeNext } from '@/lib/auth/token'

const text = copy.auth.signUp

export const metadata = { title: text.meta.title }

export default async function SignUpPage({ searchParams }) {
  const next = safeNext((await searchParams).next, '')
  const user = await getCurrentUser()
  if (user) redirect(next || homeFor(user.profile.role))
  return (
    <>
      <LargeTitle subtitle={text.subtitle}>{text.title}</LargeTitle>
      <div className="flex flex-col gap-4">
        <AuthForm
          action={signUpAction}
          fields={signUpFields}
          hidden={{ next }}
          submitLabel={text.submit}
        />
        <p className="text-callout text-label-2">
          {text.haveAccount} <AuthLink href="/auth">{text.signIn}</AuthLink>
        </p>
        <p className="text-callout text-label-2">
          {copy.auth.signIn.forCompanies}{' '}
          <AuthLink href="/auth/operator">{copy.auth.signIn.createCompany}</AuthLink>
        </p>
      </div>
    </>
  )
}
