import { z } from 'zod'
import { STAFF_ROLES, isSecondFactorPaused } from '@carvo/shared'
import { AppError } from '../lib/errors.js'
import { createAnonClient, createUserClient } from '../lib/supabase.js'
import { hasVerifiedFactor } from '../lib/factors.js'
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
const mfaRequired = () =>
  process.env.REQUIRE_STAFF_MFA !== 'false' && !isSecondFactorPaused(process.env)

const bearerToken = (req) => {
  const header = req.get('authorization') ?? ''
  return header.startsWith('Bearer ') ? header.slice(7) : null
}

/** Checks the token with Supabase and sets `req.auth`: the user, a database client acting as them, and their session's strength. */
async function readSession(req) {
  const token = bearerToken(req)
  if (!token) throw new AppError('UNAUTHENTICATED')
  const { data, error } = await createAnonClient().auth.getUser(token)
  if (error || !data.user) throw new AppError('UNAUTHENTICATED')
  req.auth = {
    user: data.user,
    db: createUserClient(token),
    aal: assuranceLevel(token),
    hasSecondFactor: hasVerifiedFactor(data.user),
  }
}

/**
 * Check the Supabase access token on a request. Sets `req.auth` to the user and a database
 * client that acts as that user, so Row Level Security applies to everything the route does.
 * Someone who has turned on the authenticator app must have used it (aal2): a password alone gets them nowhere.
 */
export async function authenticate(req, _res, next) {
  await readSession(req)
  const isCodeDue = req.auth.hasSecondFactor && !isSecondFactorPaused(process.env)
  if (isCodeDue && req.auth.aal !== 'aal2') {
    throw new AppError('FORBIDDEN', {
      message: 'Enter the code from your authenticator app to continue.',
      details: { reason: 'mfa_required' },
    })
  }
  next()
}

/**
 * Like `authenticate`, but lets a session that has only used the password through. Only for "who am I", which the
 * website asks right after the password to find out whether to ask for the authenticator code.
 */
export async function authenticateFirstStep(req, _res, next) {
  await readSession(req)
  next()
}

/** Sign-in, and the user's role (from their profile) must be one of `roles`. Use with `router.use`. */
export const requireRoles = (...roles) => [
  authenticate,
  async (req, _res, next) => {
    const { db, user } = req.auth
    const profile = await findProfile(
      db,
      user.id,
      'role, operator_id, operator:operators!operator_id(slug)',
    )
    if (!profile || !roles.includes(profile.role)) throw new AppError('FORBIDDEN')
    // A second factor is required of staff and admin; a rental company's people may choose it (and then must use it).
    if (mfaRequired() && STAFF_ROLES.includes(profile.role) && req.auth.aal !== 'aal2') {
      throw new AppError('FORBIDDEN', {
        message: 'Sign in with your second factor to use this.',
        details: { reason: 'mfa_required' },
      })
    }
    req.auth.role = profile.role
    req.auth.operatorId = profile.operator_id
    req.auth.operatorSlug = profile.operator?.slug
    next()
  },
]

/** `router.param('id', idParam)`: a path id that is not a uuid is a NOT_FOUND. */
export const idParam = (_req, _res, next, id) => {
  if (!z.uuid().safeParse(id).success) throw new AppError('NOT_FOUND')
  next()
}
