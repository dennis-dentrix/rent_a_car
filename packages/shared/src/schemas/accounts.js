import { z } from 'zod'
import { STAFF_ROLES } from '../constants.js'
import { e164Phone, hasAtLeastOneField } from './common.js'

/** What a signed-in person can change about themselves. Role and company are never changed here. */
export const updateProfileSchema = z
  .strictObject({
    full_name: z.string().trim().min(2).max(120).optional(),
    phone: e164Phone.optional(),
    marketing_opt_in: z.boolean().optional(),
  })
  .refine(...hasAtLeastOneField)

/** An admin invites a team member by email, or gives an existing account a staff role. */
export const inviteStaffSchema = z.strictObject({
  email: z.email(),
  full_name: z.string().trim().min(2).max(120),
  role: z.enum(STAFF_ROLES),
})

export const updateStaffSchema = z
  .strictObject({ role: z.enum(STAFF_ROLES).optional(), active: z.boolean().optional() })
  .refine(...hasAtLeastOneField)
