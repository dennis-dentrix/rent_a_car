import { listPage } from '../lib/pagination.js'
import { unwrap } from '../lib/supabase.js'
import { chatContext } from './message-context.js'
import { findOne } from './records.js'

// Conversations between a renter and a rental company about a car. Each call acts as the signed-in person: Row Level
// Security shows only their own, and the database functions decide who may write and hide contact details.
const COLUMNS =
  'id, vehicle_id, car_name, company_name, renter_name, start_at, end_at, awaiting_company, created_at, ' +
  'renter_id, renter_read_at, company_read_at, last_message_at, last_message, last_from_company'
const SHOWN = 100

// Whether the latest message is the other side's and arrived after this side last looked.
function shaped(viewerId, conversation) {
  const { renter_id: renterId, renter_read_at, company_read_at, ...shown } = conversation
  const isCompany = renterId !== viewerId
  const seenAt = isCompany ? company_read_at : renter_read_at
  const isFromOther = shown.last_from_company === !isCompany
  const isUnread = isFromOther && (!seenAt || new Date(shown.last_message_at) > new Date(seenAt))
  return { ...shown, is_unread: isUnread }
}

export async function listConversations({ db, user }, page) {
  const found = await listPage(db.from('conversations').select(COLUMNS), page)
  return { ...found, data: found.data.map((conversation) => shaped(user.id, conversation)) }
}

const latestMessages = async (db, id) =>
  unwrap(
    await db
      .from('messages')
      .select('id, is_from_company, body, created_at')
      .eq('conversation_id', id)
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(SHOWN),
  ).reverse()

/** One conversation: its latest messages, oldest first, the car it is about, and the renter's booking of it. */
export async function getConversation({ db, user }, id) {
  const conversation = await findOne(db, 'conversations', COLUMNS, id)
  const [messages, context] = await Promise.all([
    latestMessages(db, id),
    chatContext(db, conversation),
  ])
  return { ...shaped(user.id, conversation), ...context, messages }
}

export async function markRead({ db }, id) {
  unwrap(await db.rpc('mark_conversation_read', { p_conversation_id: id }))
  return { id }
}

export async function startConversation(auth, input) {
  const id = unwrap(
    await auth.db.rpc('start_conversation', {
      p_vehicle_id: input.vehicle_id,
      p_start: input.start_at ?? null,
      p_end: input.end_at ?? null,
      p_body: input.body,
    }),
  )
  return getConversation(auth, id)
}

export async function replyTo(auth, id, { body }) {
  unwrap(await auth.db.rpc('send_message', { p_conversation_id: id, p_body: body }))
  return getConversation(auth, id)
}
