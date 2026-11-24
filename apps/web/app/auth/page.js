import { redirect } from 'next/navigation'
import { signInAction } from '@/app/auth/actions'
import AuthForm from '@/components/AuthForm'
import AuthLink from '@/components/AuthLink'
import AuthNotice from '@/components/AuthNotice'
import LargeTitle from '@/components/LargeTitle'
import { copy } from '@/copy/en'
import { signInFields } from '@/lib/auth/fields'
import { homeFor } from '@/lib/auth/roles'
import { getCurrentUser } from '@/lib/auth/session'
import { safeNext } from '@/lib/auth/token'

const text = copy.auth.signIn

export default async function SignInPage({ searchParams }) {
  const { next, notice } = await searchParams
  const user = await getCurrentUser()
  if (user) redirect(safeNext(next, homeFor(user.profile.role)))
  const around = next ? `?next=${encodeURIComponent(safeNext(next, ''))}` : ''
  return (
    <>
      <LargeTitle subtitle={text.subtitle}>{text.title}</LargeTitle>
      <div className="flex flex-col gap-4">
        <AuthNotice name={notice} />
        <AuthForm
          action={signInAction}
          fields={signInFields}
          hidden={{ next: safeNext(next, '') }}
          submitLabel={text.submit}
        />
        <p className="text-callout">
          <AuthLink href="/auth/forgot">{text.forgot}</AuthLink>
        </p>
        <p className="text-callout text-label-2">
          {text.noAccount} <AuthLink href={`/auth/sign-up${around}`}>{text.createAccount}</AuthLink>
        </p>
        <p className="text-callout text-label-2">
          {text.forCompanies} <AuthLink href="/auth/operator">{text.createCompany}</AuthLink>
        </p>
      </div>
    </>
  )
}
