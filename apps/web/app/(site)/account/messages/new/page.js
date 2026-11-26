import { redirect } from 'next/navigation'
import { startConversationAction } from '@/app/messages/actions'
import ChatScreen from '@/components/ChatScreen'
import ChatThread from '@/components/ChatThread'
import { copy } from '@/copy/en'
import { apiGet } from '@/lib/api'
import { requireRole } from '@/lib/auth/session'
import { carName } from '@/lib/car-facts'
import { getVehicle } from '@/lib/catalogue'
import { carPath } from '@/lib/live-cars'
import { withParams } from '@/lib/query'
import { carriedChoices, stayRequest } from '@/lib/stay-query'

export const metadata = { title: copy.messages.title, robots: { index: false, follow: false } }

// A chat about a car that has no messages yet. A renter who has asked about this car before goes to that chat. A
// visitor signs in first and returns here with the same car and dates.
export default async function NewMessagePage({ searchParams }) {
  const query = await searchParams
  const { token } = await requireRole(null, withParams('/account/messages/new', query))
  const [{ data: car }, all] = await Promise.all([
    getVehicle(query.car ?? ''),
    apiGet('/messages', { token }),
  ])
  if (!car) redirect('/cars')
  const conversations = all.data ?? []
  const earlier = conversations.find((conversation) => conversation.vehicle_id === car.id)
  if (earlier) redirect(`/account/messages/${earlier.id}`)
  const request = stayRequest(query)
  const backHref = withParams(carPath(car) ?? '/cars', carriedChoices(query))
  const heading = { title: car.operator_name, detail: carName(car, car.class?.name), backHref }
  return (
    <ChatScreen list={{ conversations, side: 'renter' }} heading={heading}>
      <ChatThread
        messages={[]}
        side="renter"
        action={startConversationAction}
        hidden={{ vehicle_id: car.id, start_at: request.from, end_at: request.to }}
        suggestions={copy.messages.suggestions}
      />
    </ChatScreen>
  )
}
