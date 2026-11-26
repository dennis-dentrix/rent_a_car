import { DOCUMENT_CONTENT_TYPES, MAX_FILE_BYTES } from '@carvo/shared'
import { completeDocumentAction, requestDocumentAction } from '@/app/(site)/account/actions'
import { sendToLink } from '@/lib/upload'

const problemWith = (file) => {
  if (!DOCUMENT_CONTENT_TYPES.includes(file.type)) return 'type'
  return file.size > MAX_FILE_BYTES ? 'size' : null
}

/** Sends an ID or licence for a booking. Resolves to { error: 'type' | 'size' | 'upload' } or {}. */
export async function uploadDocument(file, { bookingId, type }) {
  const problem = problemWith(file)
  if (problem) return { error: problem }
  const declaration = { content_type: file.type, size_bytes: file.size }
  const link = await requestDocumentAction({ type, booking_id: bookingId, ...declaration })
  if (link.error || !(await sendToLink(link.data, file))) return { error: 'upload' }
  const done = await completeDocumentAction(link.data.id, bookingId)
  return done.error ? { error: 'upload' } : {}
}
