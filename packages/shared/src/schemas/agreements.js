import { z } from 'zod'

// Signing the rental agreement online. The customer reads the agreement (GET .../agreement), then signs it by
// ticking the box, typing their full name, and optionally drawing their signature.

/** A PNG of the drawn signature as base64, without the "data:" prefix. Kept small so it fits the request limit. */
export const MAX_SIGNATURE_BASE64_LENGTH = 80_000

export const signAgreementSchema = z.strictObject({
  signed_name: z.string().trim().min(2).max(120),
  accept_terms: z.literal(true, { error: 'You must accept the agreement to sign it.' }),
  // The fingerprint of the agreement the customer was shown. If the booking or terms changed since, it no longer
  // matches and the customer must read the agreement again.
  terms_sha256: z.string().regex(/^[0-9a-f]{64}$/),
  signature_image: z
    .string()
    .regex(/^[A-Za-z0-9+/]+={0,2}$/, 'Send the image as base64 without a data: prefix.')
    .max(MAX_SIGNATURE_BASE64_LENGTH)
    .optional(),
})
