import { STAFF_ROLES } from '@rent-a-car/shared'

export const isStaffRole = (role) => STAFF_ROLES.includes(role)

/** Staff and admin must use the authenticator app (docs/technical-architecture.md): they cannot turn it off. */
export const isSecondFactorRequired = (role) => isStaffRole(role)

/**
 * Whether this person must enter an authenticator code after their password: anyone whose role requires it, and anyone
 * else who has chosen to turn it on in Settings. Everyone else goes straight in.
 */
export const needsSecondFactor = (profile) =>
  isSecondFactorRequired(profile.role) || profile.has_second_factor === true

/** The first page after signing in, when no page was asked for. */
export const homeFor = (role) =>
  ({ admin: '/admin', customer: '/account', operator: '/console' })[role] ?? '/'
