import { redirect } from 'next/navigation'
import { verifyEmailAction } from '@/app/auth/actions'
import AuthForm from '@/components/AuthForm'
import AuthLink from '@/components/AuthLink'
import LargeTitle from '@/components/LargeTitle'
import ResendCode from '@/components/ResendCode'
import { copy } from '@/copy/en'
import { codeFields } from '@/lib/auth/fields'
import { safeNext } from '@/lib/auth/token'

const text = copy.auth.verifyEmail

export const metadata = { title: text.meta.title }

// The step after creating an account: the six-digit code that was emailed confirms the address and signs the person in.
export default async function VerifyEmailPage({ searchParams }) {
  const { email, next } = await searchParams
  if (!email) redirect('/auth/sign-up')
  return (
    <>
      <LargeTitle subtitle={text.subtitle(email)}>{text.title}</LargeTitle>
      <div className="flex flex-col gap-4">
        <AuthForm
          action={verifyEmailAction}
          fields={codeFields}
          hidden={{ email, next: safeNext(next, '') }}
          submitLabel={text.submit}
        />
        <ResendCode email={email} />
        <p className="text-center text-callout">
          <AuthLink href="/auth/sign-up">{text.wrongEmail}</AuthLink>
        </p>
      </div>
    </>
  )
}
