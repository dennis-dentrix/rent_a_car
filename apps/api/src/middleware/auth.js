import { z } from 'zod'
import { AppError } from '../lib/errors.js'
import { createAnonClient, createUserClient } from '../lib/supabase.js'
import { findProfile } from '../services/accounts.js'

// The access token was already verified with Supabase, so its claims can be read safely.
const assuranceLevel = (token) => {
  try {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString()).aal
  } catch {
    return undefined
  }
}

// Staff and admin must have signed in with a second factor (aal2). Set REQUIRE_STAFF_MFA=false to
// switch this off for local development only.
const mfaRequired = () => process.env.REQUIRE_STAFF_MFA !== 'false'

const bearerToken = (req) => {
  const header = req.get('authorization') ?? ''
  return header.startsWith('Bearer ') ? header.slice(7) : null
}

/**
 * Check the Supabase access token on a request. Sets `req.auth` to the user and a database
 * client that acts as that user, so Row Level Security applies to everything the route does.
 */
export async function authenticate(req, _res, next) {
  const token = bearerToken(req)
  if (!token) throw new AppError('UNAUTHENTICATED')
  const { data, error } = await createAnonClient().auth.getUser(token)
  if (error || !data.user) throw new AppError('UNAUTHENTICATED')
  req.auth = { user: data.user, db: createUserClient(token), aal: assuranceLevel(token) }
  next()
}

/** Sign-in, and the user's role (from their profile) must be one of `roles`. Use with `router.use`. */
export const requireRoles = (...roles) => [
  authenticate,
  async (req, _res, next) => {
    const { db, user } = req.auth
    const profile = await findProfile(db, user.id, 'role')
    if (!profile || !roles.includes(profile.role)) throw new AppError('FORBIDDEN')
    if (mfaRequired() && req.auth.aal !== 'aal2') {
      throw new AppError('FORBIDDEN', {
        message: 'Sign in with your second factor to use this.',
        details: { reason: 'mfa_required' },
      })
    }
    req.auth.role = profile.role
    next()
  },
]

/** `router.param('id', idParam)`: a path id that is not a uuid is a NOT_FOUND. */
export const idParam = (_req, _res, next, id) => {
  if (!z.uuid().safeParse(id).success) throw new AppError('NOT_FOUND')
  next()
}
