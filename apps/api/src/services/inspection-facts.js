import { createHash } from 'node:crypto'
import { describeFile } from '../lib/storage.js'
import { unwrap } from '../lib/supabase.js'

const RECORD =
  'id, booking_id, vehicle_id, type, fuel_level, mileage_km, condition_notes, damage_noted, checklist, recorded_at, ' +
  'booking:bookings(reference, start_at, end_at, customer_id, operator_id, class_id, ' +
  'customer:profiles(full_name, email, phone)), vehicle:vehicles(registration, make, model, year, colour)'

// The company's rules for the booked class: its own where set, otherwise the general ones.
async function loadPolicy(admin, { operator_id: operatorId, class_id: classId }) {
  if (!operatorId) return null
  const rows = unwrap(
    await admin
      .from('operator_policies')
      .select('class_id, min_hire_days, min_age, cross_border, daily_km_limit, fuel_policy, rules')
      .eq('operator_id', operatorId),
  )
  const general = rows.find((row) => row.class_id === null) ?? {}
  const own = rows.find((row) => row.class_id === classId) ?? {}
  const set = Object.fromEntries(Object.entries(own).filter(([, value]) => value !== null))
  const { class_id: _scope, ...policy } = { ...general, ...set }
  return Object.keys(policy).length ? policy : null
}

const loadCompany = async (admin, id) =>
  id
    ? unwrap(await admin.from('operators').select('business_name, phone').eq('id', id).single())
    : null

/**
 * Everything an inspection report says, read with the service role after the caller's right to see it was checked:
 * the record, its booking, car, company, rules, files, signatures, and the sealed copy if there is one.
 */
export async function loadReport(admin, recordId) {
  const record = unwrap(
    await admin.from('handover_records').select(RECORD).eq('id', recordId).single(),
  )
  const [company, policy, files, signatures, seal] = await Promise.all([
    loadCompany(admin, record.booking.operator_id),
    loadPolicy(admin, record.booking),
    admin
      .from('inspection_files')
      .select('id, kind, label, caption, storage_path, content_type, size_bytes')
      .eq('handover_record_id', recordId)
      .order('storage_path'),
    admin
      .from('inspection_signatures')
      .select('party, signed_name, method, signature_path, report_sha256, signed_at')
      .eq('handover_record_id', recordId)
      .order('signed_at'),
    admin.from('inspection_reports').select('*').eq('handover_record_id', recordId).maybeSingle(),
  ])
  return {
    record,
    company,
    policy,
    files: unwrap(files),
    signatures: unwrap(signatures),
    seal: unwrap(seal),
  }
}

/**
 * The report's fingerprint: a SHA-256 of what was recorded and of the stored version of every photo. A different
 * word, figure, or picture gives a different fingerprint. The company's rules are not part of what was inspected.
 */
export async function fingerprint({ record, files }) {
  const versions = await Promise.all(files.map((file) => describeFile(file.storage_path)))
  const content = [
    record.id,
    record.booking.reference,
    record.vehicle.registration,
    record.type,
    record.fuel_level,
    record.mileage_km,
    record.condition_notes,
    record.damage_noted,
    Object.entries(record.checklist ?? {}).sort(([a], [b]) => a.localeCompare(b)),
    new Date(record.recorded_at).toISOString(),
    files.map((file, index) => [file.storage_path, file.size_bytes, versions[index]]),
  ]
  return createHash('sha256').update(JSON.stringify(content)).digest('hex')
}
