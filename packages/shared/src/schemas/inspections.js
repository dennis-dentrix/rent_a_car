import { z } from 'zod'
import { MIN_INSPECTION_PHOTOS } from '../constants.js'
import { inspectionPurpose } from '../file-purposes.js'
import { fileDeclaration, fileTypeMatchesPurpose } from './common.js'

export const FUEL_LEVELS = ['empty', 'quarter', 'half', 'three_quarters', 'full']

const fileSchema = z
  .strictObject({
    kind: z.enum(['photo', 'document']),
    label: z.string().trim().min(1).max(80).optional(),
    caption: z.string().trim().min(1).max(300).optional(),
    // Object key in the private bucket. The file itself is uploaded with a signed link.
    storage_path: z.string().trim().min(3).max(300),
    ...fileDeclaration,
  })
  .refine(...fileTypeMatchesPurpose((declared) => inspectionPurpose(declared.kind)))

export const createInspectionSchema = z.strictObject({
  booking_id: z.uuid(),
  type: z.enum(['pickup', 'return']),
  fuel_level: z.enum(FUEL_LEVELS),
  mileage_km: z.number().int().min(0),
  condition_notes: z.string().trim().min(1).max(2000).optional(),
  damage_noted: z.boolean().default(false),
  checklist: z.record(z.string(), z.unknown()).optional(),
  customer_signature_path: z.string().trim().min(3).max(300).optional(),
  files: z.array(fileSchema).max(40).default([]),
})

/** An inspection as a rental company records it: it needs photos, so both sides can see the car's condition. */
export const createHandoverSchema = createInspectionSchema.refine(
  (report) => report.files.filter((file) => file.kind === 'photo').length >= MIN_INSPECTION_PHOTOS,
  { message: `Add at least ${MIN_INSPECTION_PHOTOS} photos of the car.`, path: ['files'] },
)

const signature = {
  signed_name: z.string().trim().min(2).max(120),
  // A PNG of the drawn signature, as base64 without a data prefix.
  signature_image: z.base64().min(100).max(90_000),
  // The fingerprint of the report that was on screen, so nobody signs something that changed.
  report_sha256: z.string().regex(/^[0-9a-f]{64}$/),
}
export const signInspectionSchema = z.strictObject(signature)
/** A renter signing on the company's screen also gives the code that was emailed to them. */
export const signWithCodeSchema = z.strictObject({
  ...signature,
  code: z.string().regex(/^\d{6}$/),
})
export const reportFingerprintSchema = z.strictObject({
  sha256: z.string().regex(/^[0-9a-f]{64}$/),
})
