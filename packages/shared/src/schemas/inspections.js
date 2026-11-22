import { z } from 'zod'
import { fileDeclaration } from './common.js'

export const FUEL_LEVELS = ['empty', 'quarter', 'half', 'three_quarters', 'full']

const fileSchema = z.strictObject({
  kind: z.enum(['photo', 'document']),
  label: z.string().trim().min(1).max(80).optional(),
  caption: z.string().trim().min(1).max(300).optional(),
  // Object key in the private bucket. The file itself is uploaded with a signed link.
  storage_path: z.string().trim().min(3).max(300),
  ...fileDeclaration,
})

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
