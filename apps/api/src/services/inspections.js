import { randomUUID } from 'node:crypto'
import { AppError, fieldError } from '../lib/errors.js'
import {
  assertUploaded,
  createDownloadUrl,
  createUploadUrl,
  inspectionKey,
} from '../lib/storage.js'
import { unwrap } from '../lib/supabase.js'
import { findOne } from './records.js'

const REPORT_COLUMNS =
  'id, booking_id, vehicle_id, type, fuel_level, mileage_km, condition_notes, damage_noted, ' +
  'checklist, recorded_by, recorded_at'
// File paths stay on the server; a file is opened with a signed link that lasts ten minutes.
const FILE_COLUMNS = 'id, handover_record_id, kind, label, caption, content_type, size_bytes'

/**
 * Links to upload inspection photos and documents to, for one booking. The file goes straight to storage; the
 * path in each answer is what the report then refers to.
 */
export async function createInspectionUploads({ db }, bookingId, { files }) {
  await findOne(db, 'bookings', 'id', bookingId)
  return Promise.all(
    files.map(async (file) => {
      const key = inspectionKey(bookingId, randomUUID(), file.content_type)
      const link = await createUploadUrl({
        key,
        contentType: file.content_type,
        sizeBytes: file.size_bytes,
      })
      return { storage_path: key, ...link }
    }),
  )
}

/** Every file in a report must be under this booking's folder and really be in storage. */
async function verifyFiles({ booking_id, files }) {
  const folder = `inspections/${booking_id}/`
  if (files.some((file) => !file.storage_path.startsWith(folder))) {
    throw fieldError('files', 'A file does not belong to this booking. Request upload links first.')
  }
  await Promise.all(
    files.map((file) =>
      assertUploaded(file.storage_path, {
        sizeBytes: file.size_bytes,
        contentType: file.content_type,
      }),
    ),
  )
}

/** A link to open one inspection file. The customer who rented and staff can open it; others cannot see it. */
export async function getInspectionFileUrl({ db }, id) {
  const file = await findOne(db, 'inspection_files', 'storage_path', id)
  return createDownloadUrl(file.storage_path)
}

/** Save an inspection report and its photos and documents together, for the booking's vehicle. */
export async function createInspection({ db }, input) {
  await verifyFiles(input)
  const id = unwrap(
    await db.rpc('create_inspection', {
      p_booking_id: input.booking_id,
      p_type: input.type,
      p_fuel_level: input.fuel_level,
      p_mileage_km: input.mileage_km,
      p_condition_notes: input.condition_notes ?? null,
      p_damage_noted: input.damage_noted,
      p_checklist: input.checklist ?? null,
      p_signature_path: input.customer_signature_path ?? null,
      p_files: input.files,
    }),
  )
  return getInspection(db, id)
}

async function getInspection(db, id) {
  const report = await findOne(db, 'handover_records', REPORT_COLUMNS, id)
  const files = unwrap(
    await db.from('inspection_files').select(FILE_COLUMNS).eq('handover_record_id', id),
  )
  return { ...report, files }
}

/** Every inspection report for a booking, pickup and return, with its files. */
export async function listInspections({ db }, bookingId) {
  await findOne(db, 'bookings', 'id', bookingId)
  const reports = unwrap(
    await db
      .from('handover_records')
      .select(REPORT_COLUMNS)
      .eq('booking_id', bookingId)
      .order('recorded_at'),
  )
  const files = unwrap(
    await db
      .from('inspection_files')
      .select(FILE_COLUMNS)
      .in(
        'handover_record_id',
        reports.map((report) => report.id),
      ),
  )
  return reports.map((report) => ({
    ...report,
    files: files.filter((file) => file.handover_record_id === report.id),
  }))
}
