// Values the API and the web app must agree on.
export const BOOKING_STATUSES = [
  'quoted',
  'pending_payment',
  'confirmed',
  'ready',
  'active',
  'returned',
  'closed',
  'cancelled',
  'expired',
]

// Cursor pagination (docs/api-spec.md section 1).
export const DEFAULT_LIMIT = 20
export const MAX_LIMIT = 100

// Moving a booking to one of these needs a note saying why (for example the M-PESA reference when a
// deposit was received outside the system).
export const NOTE_REQUIRED_STATUSES = ['confirmed', 'cancelled', 'expired']

// Roles an admin can give to a team member.
export const STAFF_ROLES = ['staff', 'admin']

// Uploaded files: JPG, PNG, or PDF, up to 10 MB each (pack section 7).
export const DOCUMENT_CONTENT_TYPES = ['image/jpeg', 'image/png', 'application/pdf']
export const MAX_FILE_BYTES = 10 * 1024 * 1024

// Documents a customer uploads themselves, and the ones staff can also add (a scanned signed agreement).
export const CUSTOMER_DOCUMENT_TYPES = ['national_id', 'driving_licence']
export const STAFF_DOCUMENT_TYPES = [...CUSTOMER_DOCUMENT_TYPES, 'agreement']
