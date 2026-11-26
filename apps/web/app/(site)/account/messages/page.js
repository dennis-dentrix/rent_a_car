import ConversationList from '@/components/ConversationList'
import LargeTitle from '@/components/LargeTitle'
import LoadError from '@/components/LoadError'
import { copy } from '@/copy/en'
import { apiGet } from '@/lib/api'
import { requireRole } from '@/lib/auth/session'

export const metadata = { title: copy.messages.title, robots: { index: false, follow: false } }

export default async function MyMessagesPage() {
  const { token } = await requireRole(null, '/account/messages')
  const { data, error } = await apiGet('/messages', { token })
  if (error) return <LoadError text={copy.cars} href="/account/messages" />
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-5">
      <LargeTitle>{copy.messages.title}</LargeTitle>
      <ConversationList conversations={data} side="renter" />
    </div>
  )
}
