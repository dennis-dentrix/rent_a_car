import { INSPECTION_CHECKS } from '@carvo/shared'
import { copy } from '@/copy/en'

const text = copy.inspections

/** Where a report stands: sealed, or waiting for the company's or the renter's signature. */
export function reportStatus({ signed_by: signed, sealed_at: sealedAt }) {
  if (sealedAt) return { key: 'sealed', tone: 'success', label: text.status.sealed }
  const key = signed.includes('operator') ? 'renter' : 'company'
  return { key, tone: 'warning', label: text.status[key] }
}

/** The report the API takes, from what the form holds and the photos already uploaded. */
export function buildReport(formData, { bookingId, type, files }) {
  const notes = String(formData.get('condition_notes') ?? '').trim()
  return {
    booking_id: bookingId,
    type,
    fuel_level: formData.get('fuel_level'),
    mileage_km: Number(formData.get('mileage_km')),
    ...(notes && { condition_notes: notes }),
    damage_noted: formData.has('damage_noted'),
    checklist: Object.fromEntries(
      INSPECTION_CHECKS.map((check) => [check, formData.get(`check_${check}`)]),
    ),
    files,
  }
}

/** The size a photo is shrunk to: its longer side at most `limit` pixels, in the same shape. */
export function fitWithin({ width, height }, limit) {
  const scale = Math.min(1, limit / Math.max(width, height))
  return { width: Math.round(width * scale), height: Math.round(height * scale) }
}
