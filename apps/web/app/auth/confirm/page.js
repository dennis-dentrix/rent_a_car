import SubmitButton from '@/components/SubmitButton'
import { redirect } from 'next/navigation'
import { confirmLinkAction } from '@/app/auth/actions'
import LargeTitle from '@/components/LargeTitle'
import { copy } from '@/copy/en'

const text = copy.auth.confirm

export const metadata = { title: text.meta.title }

// The page an email link opens. The link is only used when the person presses the button, because mail scanners
// open links without anyone reading them, and a link that works once would be used up before it reached the person.
export default async function ConfirmLinkPage({ searchParams }) {
  const { token_hash: tokenHash, type, next } = await searchParams
  if (!tokenHash || !type) redirect('/auth?notice=link-expired')
  return (
    <>
      <LargeTitle subtitle={text.subtitle}>{text.title}</LargeTitle>
      <form action={confirmLinkAction} className="flex flex-col gap-4">
        <input type="hidden" name="token_hash" value={tokenHash} />
        <input type="hidden" name="type" value={type} />
        <input type="hidden" name="next" value={next ?? ''} />
        <SubmitButton isFullWidth>{text.submit}</SubmitButton>
      </form>
    </>
  )
}
