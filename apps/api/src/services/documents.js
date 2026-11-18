import { randomUUID } from 'node:crypto'
import { fieldError } from '../lib/errors.js'
import { listPage } from '../lib/pagination.js'
import { assertUploaded, createDownloadUrl, createUploadUrl, documentKey } from '../lib/storage.js'
import { unwrap, withServiceRole } from '../lib/supabase.js'
import { findOne, insertOne, updateOne } from './records.js'

// File paths never leave the server: the API returns these fields, and signed links when a file is opened.
const DOCUMENT_COLUMNS =
  'id, type, status, booking_id, rejection_reason, file_confirmed_at, content_type, size_bytes, created_at'
const QUEUE_COLUMNS = `${DOCUMENT_COLUMNS}, owner:profiles!documents_owner_id_fkey(full_name, phone)`

/**
 * Create the document row and a signed link to upload to. Customers cannot insert rows themselves (they
 * could point one at someone else's file), so the row is saved here with the service role.
 */
async function startUpload({ ownerId, uploaderId, bookingId = null, input }) {
  const id = randomUUID()
  const key = documentKey(ownerId, id, input.content_type)
  const row = await withServiceRole('create_document', (admin) =>
    insertOne(admin, 'documents', 'id, type, status, booking_id', {
      id,
      owner_id: ownerId,
      booking_id: bookingId,
      type: input.type,
      storage_path: key,
      content_type: input.content_type,
      size_bytes: input.size_bytes,
      uploaded_by: uploaderId,
    }),
  )
  const link = await createUploadUrl({
    key,
    contentType: input.content_type,
    sizeBytes: input.size_bytes,
  })
  return { ...row, ...link }
}

/** A customer starts uploading their own ID or licence. */
export async function createDocument({ db, user }, input) {
  if (input.booking_id) await findOne(db, 'bookings', 'id', input.booking_id)
  return startUpload({
    ownerId: user.id,
    uploaderId: user.id,
    bookingId: input.booking_id,
    input,
  })
}

/** Staff start uploading a document for a booking's customer, for example the signed agreement. */
export async function createStaffDocument({ db, user }, bookingId, input) {
  const booking = await findOne(db, 'bookings', 'id, customer_id', bookingId)
  return startUpload({ ownerId: booking.customer_id, uploaderId: user.id, bookingId, input })
}

/** The file has been uploaded. Check it is really there, then mark the document as arrived. */
export async function completeDocument({ db }, id) {
  const document = await findOne(db, 'documents', 'id, storage_path, content_type, size_bytes', id)
  await assertUploaded(document.storage_path, {
    sizeBytes: document.size_bytes,
    contentType: document.content_type,
  })
  unwrap(await db.rpc('confirm_document', { p_document_id: id }))
  return findOne(db, 'documents', DOCUMENT_COLUMNS, id)
}

export const listMyDocuments = ({ db, user }, { limit, cursor }) =>
  listPage(db.from('documents').select(DOCUMENT_COLUMNS).eq('owner_id', user.id), { limit, cursor })

/** The customer opens their own document: a link that works for ten minutes. */
export async function getMyDocumentUrl({ db, user }, id) {
  const document = await findOne(db, 'documents', 'storage_path, file_confirmed_at, owner_id', id)
  if (document.owner_id !== user.id || !document.file_confirmed_at) {
    throw fieldError('id', 'That document is not available.')
  }
  return createDownloadUrl(document.storage_path)
}

/** The review queue: uploaded documents whose file has arrived, oldest first within the page. */
export function listDocumentQueue({ db }, { status, booking_id, limit, cursor }) {
  let query = db
    .from('documents')
    .select(QUEUE_COLUMNS)
    .eq('status', status)
    .not('file_confirmed_at', 'is', null)
  if (booking_id) query = query.eq('booking_id', booking_id)
  return listPage(query, { limit, cursor })
}

/** Staff verify or reject an uploaded document. The reviewer and time are recorded. */
export async function reviewDocument({ db, user }, id, { status, rejection_reason }) {
  const document = await findOne(db, 'documents', 'id, status, file_confirmed_at', id)
  if (document.status !== 'uploaded' || !document.file_confirmed_at) {
    throw fieldError('status', 'Only an uploaded document can be reviewed.')
  }
  return updateOne(db, 'documents', DOCUMENT_COLUMNS, id, {
    status,
    rejection_reason: status === 'rejected' ? rejection_reason : null,
    reviewed_by: user.id,
    reviewed_at: new Date().toISOString(),
  })
}

/** Staff open a customer's document. The reason and the reader are logged before the link is made. */
export async function getStaffDocumentUrl({ db, user }, id, { reason }) {
  const document = await findOne(db, 'documents', 'storage_path, file_confirmed_at', id)
  if (!document.file_confirmed_at) throw fieldError('id', 'That document has no file yet.')
  // Staff may add to the access log but not read it, so the row is not selected back.
  unwrap(
    await db.from('document_access_log').insert({ document_id: id, accessed_by: user.id, reason }),
  )
  return createDownloadUrl(document.storage_path)
}
