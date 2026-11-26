import { redirect } from 'next/navigation'
import { signUpAction } from '@/app/auth/actions'
import AuthLink from '@/components/AuthLink'
import AuthScreen from '@/components/AuthScreen'
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
  const form = {
    action: signUpAction,
    fields: signUpFields,
    hidden: { next },
    submitLabel: text.submit,
  }
  return (
    <AuthScreen text={text} form={form}>
      <p className="text-callout text-label-2">
        {text.haveAccount} <AuthLink href="/auth">{text.signIn}</AuthLink>
      </p>
      <p className="text-callout text-label-2">
        {copy.auth.signIn.forCompanies}{' '}
        <AuthLink href="/auth/operator">{copy.auth.signIn.createCompany}</AuthLink>
      </p>
    </AuthScreen>
  )
}
