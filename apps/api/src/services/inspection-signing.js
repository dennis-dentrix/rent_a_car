import { randomUUID } from 'node:crypto'
import { PDFDocument } from 'pdf-lib'
import { CODE_MINUTES, checkCode, hashCode, newCode } from '../domain/inspection-code.js'
import { emailConfigured, sendEmail } from '../lib/email.js'
import { AppError, fieldError } from '../lib/errors.js'
import { createDownloadUrl, putObject, signatureKey } from '../lib/storage.js'
import { unwrap, withServiceRole } from '../lib/supabase.js'
import { fingerprint, loadReport } from './inspection-facts.js'
import { isSignedByBoth, sealIfComplete } from './inspection-sealing.js'
import { renderEmail } from './notification-templates.js'
import { findOne } from './records.js'

const PNG_HEADER = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

// The caller may see this report: Row Level Security shows a company its own, a renter their own, staff any.
const assertVisible = (db, recordId) => findOne(db, 'handover_records', 'id', recordId)

// A photo or document with a link to look at it for ten minutes. Storage paths never leave the server.
const toViewable = async ({ storage_path: path, ...file }) => ({
  ...file,
  url: (await createDownloadUrl(path, file.content_type)).url,
})

// A report signed by both but not sealed (the sealing failed part way) is sealed the next time it is read.
async function loadSealed(admin, recordId) {
  const report = await loadReport(admin, recordId)
  if (report.seal || !isSignedByBoth(report.signatures)) return report
  await sealIfComplete(admin, recordId)
  return loadReport(admin, recordId)
}

/** The whole report to read and sign, with the fingerprint to send back when signing. */
export async function getReport({ db }, recordId) {
  await assertVisible(db, recordId)
  return withServiceRole('read_inspection', async (admin) => {
    const report = await loadSealed(admin, recordId)
    const { booking, ...record } = report.record
    return {
      ...record,
      reference: booking.reference,
      renter: booking.customer,
      company: report.company,
      policy: report.policy,
      files: await Promise.all(report.files.map(toViewable)),
      signatures: report.signatures.map(({ party, signed_name, method, signed_at }) => ({
        party,
        signed_name,
        method,
        signed_at,
      })),
      sealed: report.seal && {
        sealed_at: report.seal.sealed_at,
        pdf_sha256: report.seal.pdf_sha256,
      },
      report_sha256: await fingerprint(report),
    }
  })
}

/** A ten-minute link to the sealed PDF. */
export async function getSealedPdfUrl({ db }, recordId) {
  const sealed = await findOne(
    db,
    'inspection_reports',
    'storage_path',
    recordId,
    'handover_record_id',
  )
  return createDownloadUrl(sealed.storage_path, 'application/pdf')
}

// The drawn signature must be a picture that can later be placed in the report.
async function decodePng(base64) {
  const bytes = Buffer.from(base64, 'base64')
  const refusal = fieldError('signature_image', 'The signature must be a PNG image.')
  if (!bytes.subarray(0, 8).equals(PNG_HEADER)) throw refusal
  await (await PDFDocument.create()).embedPng(bytes).catch(() => {
    throw refusal
  })
  return bytes
}

async function assertSignable(report, { party, input }) {
  if (report.signatures.some((entry) => entry.party === party)) {
    throw new AppError('CONFLICT', { message: 'This report is already signed on that side.' })
  }
  const current = await fingerprint(report)
  const earlier = report.signatures[0]?.report_sha256 ?? current
  if (input.report_sha256 !== current || earlier !== current) {
    throw fieldError('report_sha256', 'The report has changed since it was read. Read it again.')
  }
}

// `signing` is { recordId, party, signerId, method, input, evidence }.
async function store(admin, signing) {
  const { recordId, party, signerId, method, input, evidence } = signing
  const report = await loadReport(admin, recordId)
  await assertSignable(report, signing)
  const path = signatureKey(report.record.booking_id, randomUUID())
  await putObject(path, await decodePng(input.signature_image), 'image/png')
  unwrap(
    await admin.from('inspection_signatures').insert({
      handover_record_id: recordId,
      party,
      signer_id: signerId,
      signed_name: input.signed_name,
      method,
      signature_path: path,
      report_sha256: input.report_sha256,
      ip_address: evidence.ip ?? null,
      user_agent: evidence.userAgent?.slice(0, 300) ?? null,
    }),
  )
  await sealIfComplete(admin, recordId)
}

const save = async (auth, signing) => {
  await withServiceRole('sign_inspection', (admin) => store(admin, signing))
  return getReport(auth, signing.recordId)
}

/** The rental company signs. The router has already checked the caller is its person. */
export async function signAsCompany(auth, recordId, input, evidence) {
  await assertVisible(auth.db, recordId)
  const signing = { recordId, party: 'operator', signerId: auth.user.id, method: 'on_device' }
  return save(auth, { ...signing, input, evidence })
}

// Whose booking the report is about.
async function renterOf(admin, recordId) {
  const { record } = await loadReport(admin, recordId)
  return { id: record.booking.customer_id, ...record.booking.customer }
}

/** The renter signs from their own account. Only the person who booked can. */
export async function signAsRenter(auth, recordId, input, evidence) {
  await assertVisible(auth.db, recordId)
  const renter = await withServiceRole('sign_inspection', (admin) => renterOf(admin, recordId))
  if (renter.id !== auth.user.id) throw new AppError('NOT_FOUND')
  const signing = { recordId, party: 'renter', signerId: auth.user.id, method: 'account' }
  return save(auth, { ...signing, input, evidence })
}

/** Emails the renter a code to sign with on the company's screen. */
export async function sendRenterCode(
  { db },
  recordId,
  { send = sendEmail, now = new Date() } = {},
) {
  await assertVisible(db, recordId)
  if (send === sendEmail && !emailConfigured()) {
    throw new AppError('CONFLICT', {
      message:
        'Email is not set up, so no code can be sent. The renter can sign from their account.',
    })
  }
  return withServiceRole('send_inspection_code', async (admin) => {
    const renter = await renterOf(admin, recordId)
    const code = newCode()
    unwrap(
      await admin.from('inspection_codes').upsert({
        handover_record_id: recordId,
        code_hash: hashCode(code, recordId),
        expires_at: new Date(now.getTime() + CODE_MINUTES * 60_000).toISOString(),
        attempts: 0,
      }),
    )
    const email = renderEmail('inspection_code', { payload: { code, minutes: CODE_MINUTES } })
    await send({ to: renter.email, ...email })
    return { sent_to: renter.email, minutes: CODE_MINUTES }
  })
}

const CODE_PROBLEMS = {
  wrong: 'That code is not right.',
  expired: 'That code has run out. Send a new one.',
  locked: 'Too many tries. Send a new code.',
  missing: 'Send a code to the renter first.',
}

const refuseCode = (verdict) => {
  throw fieldError('code', CODE_PROBLEMS[verdict])
}

// A try is claimed before the code is judged: the update only succeeds for the first of any guesses made together.
async function useCode(admin, recordId, code) {
  const codes = () => admin.from('inspection_codes')
  const stored = unwrap(await codes().select('*').eq('handover_record_id', recordId).maybeSingle())
  const verdict = checkCode(stored, { code, recordId, now: new Date() })
  if (verdict !== 'ok' && verdict !== 'wrong') refuseCode(verdict)
  const claimed = unwrap(
    await codes()
      .update({ attempts: stored.attempts + 1 })
      .eq('handover_record_id', recordId)
      .eq('attempts', stored.attempts)
      .select('handover_record_id'),
  )
  if (claimed.length === 0 || verdict === 'wrong') refuseCode('wrong')
}

const spendCode = (recordId) =>
  withServiceRole('sign_inspection', async (admin) =>
    unwrap(await admin.from('inspection_codes').delete().eq('handover_record_id', recordId)),
  )

/** The renter signs on the company's screen, proving who they are with the emailed code. */
export async function signWithCode(auth, recordId, { code, ...input }, evidence) {
  await assertVisible(auth.db, recordId)
  const renter = await withServiceRole('sign_inspection', async (admin) => {
    await useCode(admin, recordId, code)
    return renterOf(admin, recordId)
  })
  const signing = { recordId, party: 'renter', signerId: renter.id, method: 'on_device' }
  const report = await save(auth, { ...signing, input, evidence })
  await spendCode(recordId)
  return report
}
