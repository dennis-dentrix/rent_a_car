import { MAX_AVATAR_BYTES } from '@carvo/shared'
import { requestAvatarUploadAction, setAvatarAction } from '@/app/(site)/account/actions'
import { checkPicture, sendToLink } from '@/lib/upload'

/** Sends a profile picture: link, file, save. Resolves to { profile } or { error: 'type' | 'size' | 'upload' | 'save' }. */
export async function uploadAvatar(file) {
  const problem = checkPicture(file, MAX_AVATAR_BYTES)
  if (problem) return { error: problem }
  const declaration = { content_type: file.type, size_bytes: file.size }
  const link = await requestAvatarUploadAction(declaration)
  if (link.error) return { error: 'upload' }
  if (!(await sendToLink(link.data, file))) return { error: 'upload' }
  const saved = await setAvatarAction({ ...declaration, storage_path: link.data.storage_path })
  return saved.error ? { error: 'save' } : { profile: saved.data }
}
