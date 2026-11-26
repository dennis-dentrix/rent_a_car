import { nairobiDate } from '@carvo/shared'
import Alert from '@/components/Alert'
import Button from '@/components/Button'
import ConversationScreen from '@/components/ConversationScreen'
import { copy } from '@/copy/en'
import { orNotFound } from '@/lib/admin'
import { apiGet } from '@/lib/api'
import { requireRole } from '@/lib/auth/session'
import { getVehicle } from '@/lib/catalogue'
import { carPath } from '@/lib/live-cars'
import { withParams } from '@/lib/query'

export const metadata = { title: copy.messages.title, robots: { index: false, follow: false } }

// The way from the chat to booking the car, with the dates the renter first asked about.
async function BookLink({ conversation }) {
  const { data: car } = await getVehicle(conversation.vehicle_id)
  const path = car && carPath(car)
  if (!path) return null
  const { start_at: from, end_at: to } = conversation
  const dates = from ? { start: nairobiDate(from), end: nairobiDate(to) } : {}
  return (
    <Button href={withParams(path, dates)} size="compact" className="shrink-0">
      {copy.messages.book}
    </Button>
  )
}

export default async function MyConversationPage({ params }) {
  const { id } = await params
  const { token } = await requireRole(null, `/account/messages/${id}`)
  const [one, all] = await Promise.all([
    apiGet(`/messages/${encodeURIComponent(id)}`, { token }),
    apiGet('/messages', { token }),
  ])
  const { data } = orNotFound(one)
  if (!data) return <Alert tone="error" title={copy.admin.loadError} />
  return (
    <ConversationScreen
      conversation={data}
      conversations={all.data ?? []}
      side="renter"
      action={data.booking ? null : <BookLink conversation={data} />}
    />
  )
}
