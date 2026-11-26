'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { copy } from '@/copy/en'
import { adminSend } from '@/lib/admin-send'

// Messages, for a renter and for a rental company. The API decides who may read or write each conversation.
const refused = (body) => ({ error: copy.messages.failed, body })

export async function startConversationAction(_state, formData) {
  const body = String(formData.get('body') ?? '').trim()
  const sent = await adminSend('POST', '/messages', {
    vehicle_id: formData.get('vehicle_id'),
    start_at: formData.get('start_at') || undefined,
    end_at: formData.get('end_at') || undefined,
    body,
  })
  if (sent.error) return refused(body)
  redirect(`/account/messages/${sent.data.id}`)
}

export async function replyAction(_state, formData) {
  const id = String(formData.get('conversation_id'))
  const body = String(formData.get('body') ?? '').trim()
  const sent = await adminSend('POST', `/messages/${encodeURIComponent(id)}`, { body })
  if (sent.error) return refused(body)
  revalidatePath(`/account/messages/${id}`)
  revalidatePath(`/console/messages/${id}`)
  return { sentAt: Date.now() }
}

/** Tells the server this chat is on screen, so it stops counting as unread. */
export async function markReadAction(id) {
  await adminSend('POST', `/messages/${encodeURIComponent(id)}/read`, {})
}
