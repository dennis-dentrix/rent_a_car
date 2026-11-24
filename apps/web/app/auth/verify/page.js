import { redirect } from 'next/navigation'
import { verifyAction } from '@/app/auth/actions'
import AuthForm from '@/components/AuthForm'
import LargeTitle from '@/components/LargeTitle'
import { copy } from '@/copy/en'
import { codeFields } from '@/lib/auth/fields'
import { findVerifiedFactor } from '@/lib/auth/mfa'
import { secondStepContext } from '@/lib/auth/session'

const text = copy.auth.verify

// The second step for staff and admin. Someone who has not set up an authenticator is sent to do that first.
export default async function VerifyPage({ searchParams }) {
  const { next, client } = await secondStepContext(searchParams)
  if (!client || !(await findVerifiedFactor(client))) {
    redirect(`/auth/enrol?next=${encodeURIComponent(next)}`)
  }
  return (
    <>
      <LargeTitle subtitle={text.subtitle}>{text.title}</LargeTitle>
      <AuthForm
        action={verifyAction}
        fields={codeFields}
        hidden={{ next }}
        submitLabel={text.submit}
      />
    </>
  )
}
