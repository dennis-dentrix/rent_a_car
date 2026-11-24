import { randomUUID } from 'node:crypto'
import { AppError, fieldError } from '../lib/errors.js'
import { hasVerifiedFactor } from '../lib/factors.js'
import { assertUploaded, avatarKey, createUploadUrl, removeStoredFiles } from '../lib/storage.js'
import { unwrap } from '../lib/supabase.js'
import { updateOne } from './records.js'

// A rental company's person also gets their company and where it stands in the admin's review.
const PROFILE_COLUMNS =
  'id, full_name, phone, email, role, marketing_opt_in, avatar_path, company:companies(id, name), ' +
  'operator:operators!operator_id(id, business_name, slug, status, status_reason)'

/** A user's profile with the given columns, or null when they have none or it was deleted. */
export async function findProfile(db, userId, columns) {
  return unwrap(
    await db.from('profiles').select(columns).eq('id', userId).is('deleted_at', null).maybeSingle(),
  )
}

/** The signed-in person's profile, their company if they have one, and whether they use an authenticator app. */
export async function getMe({ db, user }) {
  const profile = await findProfile(db, user.id, PROFILE_COLUMNS)
  if (!profile) throw new AppError('FORBIDDEN', { message: 'Your account has no active profile.' })
  return { ...profile, has_second_factor: hasVerifiedFactor(user) }
}

/** Change your own name, phone number, or marketing choice. Role and company cannot be changed here. */
export async function updateMe({ db, user }, input) {
  try {
    return await updateOne(db, 'profiles', PROFILE_COLUMNS, user.id, input)
  } catch (error) {
    if (error.code === 'CONFLICT') throw fieldError('phone', 'This phone number is already in use.')
    throw error
  }
}

/** A signed link to send a new profile picture to. The file goes straight to the public bucket. */
export async function createAvatarUpload(
  { user },
  { content_type: contentType, size_bytes: sizeBytes },
) {
  const key = avatarKey(user.id, randomUUID(), contentType)
  return { storage_path: key, ...(await createUploadUrl({ key, contentType, sizeBytes })) }
}

/** Makes an uploaded file the person's picture, after checking it is what it claims. The old file is deleted. */
export async function setAvatar({ db, user }, input) {
  if (!input.storage_path.startsWith(`avatars/${user.id}/`)) {
    throw fieldError('storage_path', 'That file is not yours. Request an upload link first.')
  }
  await assertUploaded(input.storage_path, {
    sizeBytes: input.size_bytes,
    contentType: input.content_type,
    purpose: 'avatar',
  })
  const before = await findProfile(db, user.id, 'avatar_path')
  const profile = await updateOne(db, 'profiles', PROFILE_COLUMNS, user.id, {
    avatar_path: input.storage_path,
  })
  if (before?.avatar_path) await removeStoredFiles([before.avatar_path])
  return profile
}

/** Takes the picture away, and deletes its file. */
export async function removeAvatar({ db, user }) {
  const before = await findProfile(db, user.id, 'avatar_path')
  const profile = await updateOne(db, 'profiles', PROFILE_COLUMNS, user.id, { avatar_path: null })
  if (before?.avatar_path) await removeStoredFiles([before.avatar_path])
  return profile
}
