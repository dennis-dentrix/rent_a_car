import { MAX_BLOG_IMAGE_BYTES } from '@rent-a-car/shared'
import { addImageAction, requestImageUploadAction } from '@/app/admin/posts/actions'
import { checkPicture, sendToLink } from '@/lib/upload'

// Sending a picture for a guide, from the browser: ask the server for a signed link, send the file straight to the
// public bucket on it, then tell the server it is there. Each step answers { error } with a short name, never throws,
// so the panel can show a sentence for it.

/** A picture's size in pixels, read before it is sent so the page can keep room for it while it loads. */
async function pixelSize(file) {
  const bitmap = await createImageBitmap(file)
  const size = { width: bitmap.width, height: bitmap.height }
  bitmap.close()
  return size
}

export const checkPostPicture = (file) => checkPicture(file, MAX_BLOG_IMAGE_BYTES)

/** Resolves to { image } when the picture is saved, or { error: 'type' | 'size' | 'upload' | 'save' }. */
export async function uploadPostImage({ postId, file, altText, caption }) {
  const problem = checkPostPicture(file)
  if (problem) return { error: problem }
  try {
    const declaration = { content_type: file.type, size_bytes: file.size }
    const link = await requestImageUploadAction(postId, declaration)
    if (link.error) return { error: 'upload' }
    if (!(await sendToLink(link.data, file))) return { error: 'upload' }
    const saved = await addImageAction(postId, {
      ...declaration,
      storage_path: link.data.storage_path,
      ...(await pixelSize(file)),
      alt_text: altText.trim(),
      ...(caption.trim() ? { caption: caption.trim() } : {}),
    })
    return saved.error ? { error: 'save' } : { image: saved.data }
  } catch {
    return { error: 'upload' }
  }
}
