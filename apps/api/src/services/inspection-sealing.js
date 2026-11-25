import { createHash } from 'node:crypto'
import { putObject, sealedReportKey } from '../lib/storage.js'
import { unwrap } from '../lib/supabase.js'
import { loadReport } from './inspection-facts.js'
import { renderInspectionPdf } from './inspection-pdf.js'

const UNIQUE_VIOLATION = '23505'

export const isSignedByBoth = (signatures) =>
  ['operator', 'renter'].every((party) => signatures.some((entry) => entry.party === party))

/**
 * Once both have signed: builds the PDF, stores it privately, records its fingerprint with the server's time, and
 * queues the renter's copy. Does nothing before then, or if the report is already sealed.
 */
export async function sealIfComplete(admin, recordId) {
  const report = await loadReport(admin, recordId)
  if (report.seal || !isSignedByBoth(report.signatures)) return
  const reportSha = report.signatures[0].report_sha256
  const bytes = await renderInspectionPdf(report, reportSha)
  const pdfSha = createHash('sha256').update(bytes).digest('hex')
  // The file is named by its own fingerprint, so a second attempt never overwrites a sealed one.
  const path = sealedReportKey(report.record.booking_id, `${recordId}-${pdfSha.slice(0, 16)}`)
  await putObject(path, bytes, 'application/pdf')
  const { error } = await admin.from('inspection_reports').insert({
    handover_record_id: recordId,
    storage_path: path,
    size_bytes: bytes.length,
    pdf_sha256: pdfSha,
    report_sha256: reportSha,
  })
  // Both signatures arriving together: whoever sealed first also sends the copy.
  if (error?.code === UNIQUE_VIOLATION) return
  unwrap({ error })
  const { booking } = report.record
  unwrap(
    await admin.from('notifications').insert({
      kind: 'inspection_report',
      to_email: booking.customer.email,
      booking_id: report.record.booking_id,
      payload: { storage_path: path, type: report.record.type },
    }),
  )
}
