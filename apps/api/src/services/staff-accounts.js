import { AppError } from '../lib/errors.js'
import { listPage } from '../lib/pagination.js'
import { logger } from '../lib/logger.js'
import { unwrap, withServiceRole } from '../lib/supabase.js'
import { findOne, updateOne } from './records.js'

const STAFF_COLUMNS = 'id, full_name, email, phone, role, deleted_at, created_at'

export const listStaff = ({ db }, { limit, cursor }) =>
  listPage(db.from('profiles').select(STAFF_COLUMNS).in('role', ['staff', 'admin']), {
    limit,
    cursor,
  })

async function inviteByEmail({ email, full_name }) {
  return withServiceRole('invite_staff', async (admin) => {
    const { data, error } = await admin.auth.admin.inviteUserByEmail(email, { data: { full_name } })
    if (error) {
      logger.error('invite_failed', { message: error.message })
      throw new AppError('VALIDATION_FAILED', { message: 'The invitation could not be sent.' })
    }
    return data.user.id
  })
}

/**
 * Give a team member a staff or admin role. A person who already has an account is promoted; anyone
 * else is sent an invitation by email. The sign-up trigger makes every new profile a customer, so the
 * role is set here, by an admin, and never from sign-up data.
 */
export async function inviteStaff({ db }, input) {
  const existing = unwrap(
    await db.from('profiles').select('id').eq('email', input.email.toLowerCase()).maybeSingle(),
  )
  const id = existing?.id ?? (await inviteByEmail(input))
  return updateOne(db, 'profiles', STAFF_COLUMNS, id, { role: input.role })
}

/** Change a team member's role, or switch their access off and on. Admins cannot change themselves. */
export async function updateStaff({ db, user }, id, { role, active }) {
  if (id === user.id) {
    throw new AppError('FORBIDDEN', { message: 'You cannot change your own role or access.' })
  }
  const member = await findOne(db, 'profiles', 'id, role', id)
  if (!['staff', 'admin'].includes(member.role)) throw new AppError('NOT_FOUND')
  const changes = {
    ...(role && { role }),
    ...(active !== undefined && { deleted_at: active ? null : new Date().toISOString() }),
  }
  return updateOne(db, 'profiles', STAFF_COLUMNS, id, changes)
}
