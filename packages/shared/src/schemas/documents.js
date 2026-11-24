import { z } from 'zod'
import { CUSTOMER_DOCUMENT_TYPES, STAFF_DOCUMENT_TYPES } from '../constants.js'
import { inspectionPurpose } from '../file-purposes.js'
import { fileDeclaration, fileTypeMatchesPurpose, pageFields } from './common.js'

/** A customer's own ID or driving licence, optionally for one booking. */
export const createDocumentSchema = z
  .strictObject({
    type: z.enum(CUSTOMER_DOCUMENT_TYPES),
    booking_id: z.uuid().optional(),
    ...fileDeclaration,
  })
  .refine(...fileTypeMatchesPurpose((declared) => declared.type))

/** A document staff add to a booking for its customer, such as the signed agreement scanned at the office. */
export const createStaffDocumentSchema = z
  .strictObject({
    type: z.enum(STAFF_DOCUMENT_TYPES),
    ...fileDeclaration,
  })
  .refine(...fileTypeMatchesPurpose((declared) => declared.type))

export const reviewDocumentSchema = z
  .strictObject({
    status: z.enum(['verified', 'rejected']),
    rejection_reason: z.string().trim().min(3).max(300).optional(),
  })
  .refine((review) => review.status === 'verified' || review.rejection_reason, {
    message: 'A reason is required when a document is rejected.',
    path: ['rejection_reason'],
  })

/** Staff must say why they open an identity document. The reason is logged. */
export const documentAccessQuerySchema = z.strictObject({
  reason: z.string().trim().min(3).max(200),
})

export const documentQueueQuerySchema = z.strictObject({
  status: z.enum(['uploaded', 'verified', 'rejected']).default('uploaded'),
  booking_id: z.uuid().optional(),
  ...pageFields,
})

/** Staff ask for upload links before saving an inspection report that has photos. */
export const inspectionUploadsSchema = z.strictObject({
  // Each file says what it is for, so a photo slot only takes a photo.
  files: z
    .array(
      z
        .strictObject({ kind: z.enum(['photo', 'document']).default('photo'), ...fileDeclaration })
        .refine(...fileTypeMatchesPurpose((declared) => inspectionPurpose(declared.kind))),
    )
    .min(1)
    .max(40),
})
