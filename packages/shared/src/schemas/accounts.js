import { z } from 'zod'
import { BLOG_IMAGE_CONTENT_TYPES, MAX_AVATAR_BYTES, STAFF_ROLES } from '../constants.js'
import { e164Phone, hasAtLeastOneField, pageFields } from './common.js'

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

/** The sign-in form. The password is checked by Supabase, so only its presence is checked here. */
export const signInSchema = z.strictObject({
  email: z.email(),
  password: z.string().min(1).max(200),
})

/** The six-digit code an authenticator app shows, for staff and admin's second factor. */
export const authCodeSchema = z.strictObject({
  code: z
    .string()
    .trim()
    .transform((value) => value.replace(/\s/g, ''))
    .pipe(z.string().regex(/^\d{6}$/)),
})

// Supabase also enforces the minimum length; 72 is the most a password can be before it is cut short when stored.
export const passwordSchema = z
  .string()
  .min(8, 'Use at least 8 characters.')
  .max(72, 'Use 72 characters or fewer.')

const emailField = z.email('Enter a valid email address.')

const passwordsMatch = [
  (value) => value.password === value.confirm_password,
  { path: ['confirm_password'], message: 'The two passwords do not match.' },
]

/** A customer creates an account. The role is never sent: the database makes every sign-up a customer. */
export const signUpSchema = z
  .strictObject({
    full_name: z
      .string()
      .trim()
      .min(2, 'Enter your full name.')
      .max(120, 'Use 120 characters or fewer.'),
    email: emailField,
    password: passwordSchema,
    confirm_password: z.string(),
  })
  .refine(...passwordsMatch)

/** Asking for a reset link needs only the email. */
export const forgotPasswordSchema = z.strictObject({ email: emailField })

/** Choosing a new password after following the reset link. */
export const resetPasswordSchema = z.strictObject({ password: passwordSchema })

const businessName = z
  .string()
  .trim()
  .min(2, 'Enter your company name.')
  .max(120, 'Use 120 characters or fewer.')

/** A signed-in customer starts a rental company. The company waits for an admin's review. */
export const registerOperatorSchema = z.strictObject({
  business_name: businessName,
  phone: e164Phone.optional(),
})

/** A rental company's owner creates an account and the company in one step. Only the name and phone reach the company. */
export const operatorSignUpSchema = z
  .strictObject({
    business_name: businessName,
    full_name: z
      .string()
      .trim()
      .min(2, 'Enter your full name.')
      .max(120, 'Use 120 characters or fewer.'),
    phone: e164Phone,
    email: emailField,
    password: passwordSchema,
    confirm_password: z.string(),
  })
  .refine(...passwordsMatch)

/** An admin's answer on a company waiting for review. A "no" always says why. */
export const reviewOperatorSchema = z
  .strictObject({
    to: z.enum(['approved', 'rejected', 'suspended']),
    reason: z.string().trim().min(1).max(500).optional(),
  })
  .refine((review) => review.to === 'approved' || Boolean(review.reason), {
    path: ['reason'],
    message: 'Say why, so the company knows what to fix.',
  })

export const operatorsQuerySchema = z.strictObject({
  ...pageFields,
  status: z.enum(['pending', 'approved', 'rejected', 'suspended']).optional(),
})

const avatarFile = {
  content_type: z.enum(BLOG_IMAGE_CONTENT_TYPES),
  size_bytes: z.number().int().min(1).max(MAX_AVATAR_BYTES),
}

/** What the browser says it is about to upload as a profile picture; the signed link accepts exactly this file. */
export const createAvatarUploadSchema = z.strictObject(avatarFile)

/** Saves the picture once it is in storage. */
export const setAvatarSchema = z.strictObject({
  ...avatarFile,
  storage_path: z.string().trim().min(3).max(300),
})

/** Changing the password from Settings: the current one proves it is the owner, and the new one is typed twice. */
export const changePasswordSchema = z
  .strictObject({
    current_password: z.string().min(1, 'Enter your current password.').max(200),
    password: passwordSchema,
    confirm_password: z.string(),
  })
  .refine(...passwordsMatch)
