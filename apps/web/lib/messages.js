import { formatFullDate, nairobiDate } from '@carvo/shared'
import { copy } from '@/copy/en'
import { formatStayRange } from '@/lib/stay-range'

/** The dates the renter was looking at, as "Mon 1 Mar – Thu 4 Mar", or "" when they gave none. */
const datesText = ({ start_at: from, end_at: to }) =>
  from && to ? formatStayRange({ start: nairobiDate(from), end: nairobiDate(to) }) : ''

/** How a conversation is headed for one side: the other party, then the car and the dates. */
export function conversationTitle(conversation, side) {
  const other = side === 'company' ? conversation.renter_name : conversation.company_name
  const detail = [conversation.car_name, datesText(conversation)].filter(Boolean).join(' · ')
  return { title: other, detail }
}

export const isOwnMessage = (message, side) => message.is_from_company === (side === 'company')

/** The messages, each first one of a Nairobi day carrying that day's date as `day`. */
export const withDayBreaks = (messages) =>
  messages.map((message, index) => {
    const before = messages[index - 1]
    const isNewDay = !before || nairobiDate(before.created_at) !== nairobiDate(message.created_at)
    return isNewDay ? { ...message, day: formatFullDate(message.created_at) } : message
  })

const lastSaid = (conversation) => conversation.last_message_at ?? conversation.created_at

/** Conversations with the latest message first. */
export const latestFirst = (conversations) =>
  [...conversations].sort((a, b) => new Date(lastSaid(b)) - new Date(lastSaid(a)))

/** The latest message as one line for a list, marked "You:" when this side wrote it. */
export function previewText(conversation, side) {
  const { last_message: body, last_from_company: isFromCompany } = conversation
  if (!body) return ''
  const isOwn = isOwnMessage({ is_from_company: isFromCompany }, side)
  return isOwn ? `${copy.messages.you}: ${body}` : body
}
