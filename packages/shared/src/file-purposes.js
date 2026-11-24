import { BLOG_IMAGE_CONTENT_TYPES, DOCUMENT_CONTENT_TYPES } from './constants.js'

// What each kind of upload may be. A car photo is a JPEG or PNG and nothing else; an identity document
// may also be a PDF. The browser's claim is never trusted: the API also reads the stored file's first
// bytes (apps/api/src/lib/file-sniff.js) and refuses one that is not what the purpose allows.
const IMAGES = ['image/jpeg', 'image/png']

export const FILE_PURPOSES = {
  national_id: DOCUMENT_CONTENT_TYPES,
  driving_licence: DOCUMENT_CONTENT_TYPES,
  // Signed at the office, then scanned or photographed.
  agreement: DOCUMENT_CONTENT_TYPES,
  inspection_photo: IMAGES,
  inspection_document: ['application/pdf'],
  // Public: the one purpose whose files are served to everyone.
  blog_image: BLOG_IMAGE_CONTENT_TYPES,
  // Public too: a person's picture is shown beside their name.
  avatar: BLOG_IMAGE_CONTENT_TYPES,
}

export const allowsContentType = (purpose, contentType) =>
  FILE_PURPOSES[purpose]?.includes(contentType) ?? false

/** An inspection file is a photo or a document; each has its own purpose and so its own allowed types. */
export const inspectionPurpose = (kind) =>
  kind === 'photo' ? 'inspection_photo' : 'inspection_document'
