import { AppError, fieldError } from '../lib/errors.js'
import { unwrap } from '../lib/supabase.js'
import { updateOne } from './records.js'

const PROFILE_COLUMNS =
  'id, full_name, phone, email, role, marketing_opt_in, company:companies(id, name)'

/** The signed-in person's profile, with their company if they belong to one. */
export async function getMe({ db, user }) {
  const profile = unwrap(
    await db
      .from('profiles')
      .select(PROFILE_COLUMNS)
      .eq('id', user.id)
      .is('deleted_at', null)
      .maybeSingle(),
  )
  if (!profile) throw new AppError('FORBIDDEN', { message: 'Your account has no active profile.' })
  return profile
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
