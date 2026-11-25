import { createInspectionAction, requestInspectionUploadsAction } from '@/app/inspections/actions'
import { buildReport, fitWithin } from '@/lib/inspections'
import { sendToLink } from '@/lib/upload'

const LONGEST_SIDE = 1600

// A phone photo is far bigger than a report needs. Shrinking it here saves the renter's data and keeps the sealed
// PDF small enough to email.
async function shrink(file) {
  const picture = await createImageBitmap(file)
  const canvas = Object.assign(document.createElement('canvas'), fitWithin(picture, LONGEST_SIDE))
  canvas.getContext('2d').drawImage(picture, 0, 0, canvas.width, canvas.height)
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error())), 'image/jpeg', 0.82),
  )
}

const declare = (photo) => ({ kind: 'photo', content_type: photo.type, size_bytes: photo.size })

/**
 * Shrinks and uploads the photos, then saves the report. Resolves to { id }, or { error } with 'unreadable' or
 * 'upload', or { message } with the server's own reason.
 */
export async function submitInspection(formData, { bookingId, type, photos }) {
  const small = await Promise.all(photos.map(shrink)).catch(() => null)
  if (!small) return { error: 'unreadable' }
  const links = await requestInspectionUploadsAction(bookingId, small.map(declare))
  if (links.error) return { message: links.error }
  const sent = await Promise.all(links.data.map((link, i) => sendToLink(link, small[i])))
  if (!sent.every(Boolean)) return { error: 'upload' }
  const files = links.data.map((link, i) => ({
    ...declare(small[i]),
    storage_path: link.storage_path,
  }))
  const saved = await createInspectionAction(buildReport(formData, { bookingId, type, files }))
  return saved.error ? { message: saved.error } : { id: saved.data.id }
}
