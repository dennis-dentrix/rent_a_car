import { redirect } from 'next/navigation'
import EnrolPanel from '@/components/EnrolPanel'
import LargeTitle from '@/components/LargeTitle'
import { copy } from '@/copy/en'
import { findVerifiedFactor } from '@/lib/auth/mfa'
import { secondStepContext } from '@/lib/auth/session'

const text = copy.auth.enrol

export default async function EnrolPage({ searchParams }) {
  const { next, client } = await secondStepContext(searchParams)
  // A second authenticator can only be added by someone who has already used the first, never from the password step.
  if (client && (await findVerifiedFactor(client))) {
    redirect(`/auth/verify?next=${encodeURIComponent(next)}`)
  }
  return (
    <>
      <LargeTitle subtitle={text.subtitle}>{text.title}</LargeTitle>
      <EnrolPanel next={next} />
    </>
  )
}
