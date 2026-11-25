import { MAX_AVATAR_BYTES } from '@carvo/shared'
import { requestAvatarUploadAction, setAvatarAction } from '@/app/(site)/account/actions'
import { uploadPicture } from '@/lib/upload'

/** Sends a profile picture. Resolves to { profile } or { error: 'type' | 'size' | 'upload' | 'save' }. */
export async function uploadAvatar(file) {
  const { data, error } = await uploadPicture(file, {
    maxBytes: MAX_AVATAR_BYTES,
    request: requestAvatarUploadAction,
    save: setAvatarAction,
  })
  return error ? { error } : { profile: data }
}
