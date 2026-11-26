'use server'

import { revalidatePath } from 'next/cache'
import { copy } from '@/copy/en'
import { adminSend } from '@/lib/admin-send'

// Running a hire as the rental company. The API and the database decide whether each move is allowed.
const text = copy.hire
const field = (formData, name) => String(formData.get(name) ?? '').trim()
const bookingPath = (id) => `/operator/bookings/${encodeURIComponent(id)}`

// A change to a booking, after which its page is drawn again.
async function change(bookingId, { method, suffix, body }) {
  const result = await adminSend(method, `${bookingPath(bookingId)}/${suffix}`, body)
  if (result.error) return result
  revalidatePath(`/console/bookings/${bookingId}`)
  revalidatePath('/console')
  return { status: 'done', sentAt: Date.now() }
}

export async function hireStatusAction(_state, formData) {
  const to = field(formData, 'to_status')
  const note = field(formData, 'note')
  if (to === 'cancelled' && !note) return { error: text.next.reasonNeeded }
  const body = { to_status: to, ...(note ? { note } : {}) }
  return change(field(formData, 'id'), { method: 'PATCH', suffix: 'status', body })
}

export async function answerRequestAction(_state, formData) {
  const accept = field(formData, 'answer') === 'accept'
  const reason = field(formData, 'reason')
  if (!accept && !reason) return { error: text.request.reasonNeeded }
  const body = { accept, ...(accept ? {} : { reason }) }
  return change(field(formData, 'id'), { method: 'POST', suffix: 'answer', body })
}

// A document's form carries both ids as "booking:document".
const documentIds = (formData) => field(formData, 'id').split(':').map(encodeURIComponent)

export async function renterDocumentReviewAction(_state, formData) {
  const [bookingId, documentId] = documentIds(formData)
  const status = field(formData, 'status')
  const reason = field(formData, 'rejection_reason')
  if (status === 'rejected' && !reason) return { error: copy.admin.documents.errors.reason }
  const body = { status, ...(status === 'rejected' ? { rejection_reason: reason } : {}) }
  return change(bookingId, { method: 'PATCH', suffix: `documents/${documentId}`, body })
}

export async function renterDocumentLinkAction(_state, formData) {
  const [bookingId, documentId] = documentIds(formData)
  const reason = field(formData, 'reason')
  if (reason.length < 3) return { error: copy.admin.documents.errors.viewReason }
  const result = await adminSend(
    'GET',
    `${bookingPath(bookingId)}/documents/${documentId}/url?reason=${encodeURIComponent(reason)}`,
  )
  return result.error ? result : { url: result.data.url, at: Date.now() }
}

export async function recordPaymentAction(_state, formData) {
  const amount = Number(field(formData, 'amount_kes'))
  if (!Number.isInteger(amount) || amount < 1) return { error: text.payment.wrong }
  const reference = field(formData, 'reference')
  const body = {
    method: field(formData, 'method'),
    amount_kes: amount,
    ...(reference ? { reference } : {}),
  }
  return change(field(formData, 'id'), { method: 'POST', suffix: 'payments', body })
}
