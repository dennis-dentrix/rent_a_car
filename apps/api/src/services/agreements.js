import { randomUUID } from 'node:crypto'
import { AppError, fieldError } from '../lib/errors.js'
import { documentKey, putObject } from '../lib/storage.js'
import { unwrap, withServiceRole } from '../lib/supabase.js'
import { loadAgreementFacts } from './agreement-facts.js'
import { renderAgreementPdf } from './agreement-pdf.js'
import { buildTerms } from './agreement-terms.js'
import { pinDocumentFile } from './documents.js'
import { findOne } from './records.js'

const SIGNATURE_COLUMNS = 'id, document_id, signed_name, signed_at, has_drawn_signature'
const EVIDENCE_COLUMNS = `${SIGNATURE_COLUMNS}, terms_version, terms_sha256, ip_address, user_agent`

/** The agreement for a booking the caller may see: customers their own, staff any. Throws NOT_FOUND otherwise. */
async function termsFor(db, bookingId) {
  await findOne(db, 'bookings', 'id', bookingId)
  return buildTerms(await loadAgreementFacts(bookingId))
}

const validSignature = async (db, bookingId, columns) =>
  unwrap(
    await db
      .from('agreement_signatures')
      .select(columns)
      .eq('booking_id', bookingId)
      .is('voided_at', null)
      .maybeSingle(),
  )

/**
 * The agreement to read: the booking summary, the numbered terms, a fingerprint to send back when signing, whether
 * it can be signed now, and the signature if there is one. Staff also get the evidence (address and device).
 */
export async function getAgreement({ db }, bookingId, { evidence = false } = {}) {
  const terms = await termsFor(db, bookingId)
  const signature = await validSignature(
    db,
    bookingId,
    evidence ? EVIDENCE_COLUMNS : SIGNATURE_COLUMNS,
  )
  return {
    booking_id: bookingId,
    reference: terms.facts.booking.reference,
    terms_version: terms.version,
    terms_sha256: terms.sha256,
    summary: terms.facts,
    clauses: terms.clauses,
    signature,
    can_sign: terms.facts.booking.status === 'confirmed' && !signature,
  }
}

/** The unsigned PDF, to read, or to print and sign at the office. */
export async function getAgreementPdf({ db }, bookingId) {
  return renderAgreementPdf(await termsFor(db, bookingId))
}

const PNG_HEADER = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

/** The drawn signature as PNG bytes, or null when none was drawn. Anything that is not a PNG is refused. */
function decodeSignatureImage(base64) {
  if (!base64) return null
  const bytes = Buffer.from(base64, 'base64')
  if (bytes.length < PNG_HEADER.length || !bytes.subarray(0, 8).equals(PNG_HEADER)) {
    throw fieldError('signature_image', 'The signature must be a PNG image.')
  }
  return bytes
}

function assertSignable(terms, input) {
  if (terms.facts.booking.status !== 'confirmed') throw new AppError('INVALID_STATUS_TRANSITION')
  if (terms.sha256 !== input.terms_sha256) {
    throw fieldError(
      'terms_sha256',
      'The agreement has changed since you read it. Please read it again.',
    )
  }
}

const recordSignature = (customerId, bookingId, documentId, key, bytes, input, evidence) =>
  withServiceRole('sign_agreement', async (admin) =>
    unwrap(
      await admin.rpc('sign_agreement', {
        p_booking_id: bookingId,
        p_customer_id: customerId,
        p_document_id: documentId,
        p_storage_path: key,
        p_size_bytes: bytes.length,
        p_signed_name: input.signed_name,
        p_signed_at: evidence.signedAt.toISOString(),
        p_terms_version: evidence.terms.version,
        p_terms_sha256: evidence.terms.sha256,
        p_snapshot: evidence.terms.facts,
        p_has_drawn: Boolean(input.signature_image),
        p_ip: evidence.ip ?? null,
        p_user_agent: evidence.userAgent?.slice(0, 300) ?? null,
      }),
    ),
  )

/**
 * The customer signs. The agreement they were shown must still be the current one (the fingerprint matches), the
 * signed PDF is stored privately, and the signature and its document are saved together as a verified agreement.
 */
export async function signAgreement(
  { db, user },
  bookingId,
  input,
  { ip, userAgent, now = new Date() },
) {
  const booking = await findOne(db, 'bookings', 'customer_id', bookingId)
  if (booking.customer_id !== user.id) throw new AppError('NOT_FOUND')
  const terms = await termsFor(db, bookingId)
  assertSignable(terms, input)
  const pngBytes = decodeSignatureImage(input.signature_image)
  const bytes = await renderAgreementPdf(terms, {
    name: input.signed_name,
    signedAt: now,
    pngBytes,
  }).catch(() => {
    throw fieldError('signature_image', 'That signature image could not be read.')
  })
  const documentId = randomUUID()
  const key = documentKey(user.id, documentId, 'application/pdf')
  const etag = await putObject(key, bytes, 'application/pdf')
  const signature = await recordSignature(user.id, bookingId, documentId, key, bytes, input, {
    terms,
    signedAt: now,
    ip,
    userAgent,
  })
  await pinDocumentFile(documentId, etag)
  return { signature_id: signature.id, document_id: documentId, signed_at: signature.signed_at }
}
