import { BLOG_IMAGE_CONTENT_TYPES } from '@carvo/shared'

// Sending a picture from the browser to a signed link, shared by guide pictures and profile pictures.

/** Why a picture cannot be sent, as a short name ('type' or 'size'), or null when it can. */
export function checkPicture(file, maxBytes) {
  if (!BLOG_IMAGE_CONTENT_TYPES.includes(file.type)) return 'type'
  if (file.size > maxBytes) return 'size'
  return null
}

// The link carries the file's length already; a browser sets that header itself and refuses to have it set.
const withoutLength = ({ 'Content-Length': _length, ...headers }) => headers

/** Sends the file to the link the server made. True when the storage accepted it. */
export async function sendToLink(link, file) {
  try {
    const sent = await fetch(link.upload_url, {
      method: 'PUT',
      headers: withoutLength(link.required_headers),
      body: file,
    })
    return sent.ok
  } catch {
    return false
  }
}

/**
 * Sends a picture in three steps: ask for a link, send the file, save it. Resolves to { data } with what saving
 * returned, or { error: 'type' | 'size' | 'upload' | 'save' }.
 */
export async function uploadPicture(file, { maxBytes, request, save }) {
  const problem = checkPicture(file, maxBytes)
  if (problem) return { error: problem }
  const declaration = { content_type: file.type, size_bytes: file.size }
  const link = await request(declaration)
  if (link.error) return { error: 'upload' }
  if (!(await sendToLink(link.data, file))) return { error: 'upload' }
  const saved = await save({ ...declaration, storage_path: link.data.storage_path })
  return saved.error ? { error: 'save' } : { data: saved.data }
}
