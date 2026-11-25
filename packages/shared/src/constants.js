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

// Images in a blog or guide: JPEG, PNG, or WebP up to 5 MB. Never SVG, which can carry scripts.
export const BLOG_IMAGE_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const MAX_BLOG_IMAGE_BYTES = 5 * 1024 * 1024

// A profile picture: the same picture types as a guide's, but a smaller file.
export const MAX_AVATAR_BYTES = 2 * 1024 * 1024

export const MAX_VEHICLE_PHOTOS = 8
export const MAX_VEHICLE_PHOTO_BYTES = 5 * 1024 * 1024

export const CROSS_BORDER_RULES = ['not_allowed', 'with_permission', 'allowed']
export const FUEL_POLICIES = ['same_level', 'full_to_full', 'prepaid']

export const TRANSMISSIONS = ['automatic', 'manual']
export const FUEL_TYPES = ['petrol', 'diesel', 'hybrid', 'electric']
export const DRIVE_TYPES = ['two_wheel', 'four_wheel', 'all_wheel']
export const CHAUFFEUR_OPTIONS = ['self_drive', 'chauffeur', 'both']

// What is looked at before a car is handed over and when it comes back. Each is marked fine or not.
export const INSPECTION_CHECKS = [
  'bodywork',
  'windscreen',
  'lights',
  'tyres',
  'spare_wheel',
  'tools',
  'interior',
  'documents',
]
export const MIN_INSPECTION_PHOTOS = 4
/** The words for each check, on the screens and in the sealed report alike. */
export const INSPECTION_CHECK_LABELS = {
  bodywork: 'Bodywork',
  windscreen: 'Windscreen and windows',
  lights: 'Lights',
  tyres: 'Tyres',
  spare_wheel: 'Spare wheel',
  tools: 'Jack and tools',
  interior: 'Interior',
  documents: 'Insurance and documents',
}

/** A report's checks in the order they are asked. A database returns them in an order of its own. */
export const orderedChecks = (checklist = {}) => {
  const rank = (check) => INSPECTION_CHECKS.indexOf(check) + 1 || INSPECTION_CHECKS.length + 1
  return Object.entries(checklist ?? {}).sort(([a], [b]) => rank(a) - rank(b))
}
