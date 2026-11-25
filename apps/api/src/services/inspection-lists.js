import { unwrap, withServiceRole } from '../lib/supabase.js'
import { AppError } from '../lib/errors.js'
import { listPage } from '../lib/pagination.js'

const SUMMARY =
  'id, booking_id, type, damage_noted, recorded_at, created_at, ' +
  'signatures:inspection_signatures(party), seal:inspection_reports(sealed_at)'
const FOR_COMPANY =
  `${SUMMARY}, booking:bookings!inner(reference, operator_id, customer:profiles(full_name)), ` +
  'vehicle:vehicles(registration, make, model)'
const FOR_RENTER = `${SUMMARY}, booking:bookings!inner(reference, customer_id)`

const toSummary = ({ signatures, seal, booking, ...record }) => ({
  ...record,
  reference: booking.reference,
  renter: booking.customer?.full_name,
  signed_by: signatures.map((entry) => entry.party),
  sealed_at: seal?.sealed_at ?? null,
})

async function page(query, paging) {
  const result = await listPage(query, paging)
  return { ...result, data: result.data.map(toSummary) }
}

/** A company's inspections, newest first. */
export const listCompanyInspections = ({ db, operatorId }, paging) =>
  page(
    db.from('handover_records').select(FOR_COMPANY).eq('booking.operator_id', operatorId),
    paging,
  )

/** The reports about the signed-in renter's own bookings, newest first. */
export const listMyInspections = ({ db, user }, paging) =>
  page(db.from('handover_records').select(FOR_RENTER).eq('booking.customer_id', user.id), paging)

/** Anyone holding a copy can ask whether a PDF with this fingerprint was sealed here, and when. */
export async function verifySealedReport(sha256) {
  return withServiceRole('verify_inspection', async (admin) => {
    const found = unwrap(
      await admin
        .from('inspection_reports')
        .select('sealed_at, record:handover_records(type, booking:bookings(reference))')
        .eq('pdf_sha256', sha256)
        .maybeSingle(),
    )
    if (!found) throw new AppError('NOT_FOUND')
    return {
      sealed_at: found.sealed_at,
      type: found.record.type,
      reference: found.record.booking.reference,
    }
  })
}
