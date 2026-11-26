import { STAFF_ROLES, isSecondFactorPaused } from '@carvo/shared'

export const isStaffRole = (role) => STAFF_ROLES.includes(role)

/** Staff and admin must use the authenticator app (docs/technical-architecture.md): they cannot turn it off. */
export const isSecondFactorRequired = (role) => isStaffRole(role)

/**
 * Whether this person must enter an authenticator code after their password: anyone whose role requires it, and anyone
 * else who has chosen to turn it on in Settings. Everyone else goes straight in.
 */
export const needsSecondFactor = (profile) =>
  !isSecondFactorPaused(process.env) &&
  (isSecondFactorRequired(profile.role) || profile.has_second_factor === true)

/** The first page after signing in, when no page was asked for. */
export const homeFor = (role) =>
  ({ admin: '/admin', customer: '/account', operator: '/console' })[role] ?? '/'

const isInConsole = (path) => /^\/console(\/|\?|$)/.test(path)

/**
 * Where to go after signing in. `next` is a safe page of this site that was asked for, or "". A rental company's person
 * always lands in their dashboard, so signing in from a public page never leaves them there.
 */
export function landingFor(role, next) {
  if (role === 'operator' && !isInConsole(next)) return homeFor(role)
  return next || homeFor(role)
}
