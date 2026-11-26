'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import {
  authCodeSchema,
  forgotPasswordSchema,
  operatorSignUpSchema,
  registerOperatorSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from '@carvo/shared'
import { copy } from '@/copy/en'
import { apiGet, apiSend } from '@/lib/api'
import {
  clearPendingEmail,
  clearSession,
  readPendingEmail,
  readTokens,
  writePendingEmail,
  writeSession,
} from '@/lib/auth/cookies'
import { fieldErrors } from '@/lib/auth/fields'
import { findVerifiedFactor, startEnrol, verifyCode } from '@/lib/auth/mfa'
import { homeFor, landingFor } from '@/lib/auth/roles'
import { nextStep } from '@/lib/auth/session'
import { anonAuthClient, currentSession, signedInClient } from '@/lib/auth/supabase'
import { safeNext } from '@/lib/auth/token'

const text = copy.auth
const LINK_EXPIRED = '/auth?notice=link-expired'
// The kinds of email link that arrive at /auth/confirm.
const LINK_TYPES = ['recovery', 'signup', 'email', 'invite', 'magiclink', 'email_change']

// A server action returns { error } or { errors } to show, or redirects. A redirect throws, so it is never inside a try.

const field = (formData, name) => formData.get(name) ?? ''

const accountError = () =>
  process.env.NODE_ENV === 'production'
    ? text.errors.account
    : `${text.errors.account} ${text.errors.accountDev}`

// The page that takes the sign-up code. The address travels in a cookie, never in the link.
async function goToCodePage(email, formData) {
  writePendingEmail(await cookies(), email)
  const next = safeNext(formData.get('next'), '')
  redirect(next ? `/auth/verify-email?next=${encodeURIComponent(next)}` : '/auth/verify-email')
}

async function unconfirmed(email, formData) {
  await anonAuthClient().auth.resend({ type: 'signup', email })
  return goToCodePage(email, formData)
}

/** Step one: email and password. Staff and admin go on to their second factor; everyone else to where they were going. */
export async function signInAction(_state, formData) {
  const values = { email: field(formData, 'email') }
  const input = signInSchema.safeParse({ ...values, password: field(formData, 'password') })
  // One message for an unknown email and a wrong password, so the form does not say which accounts exist.
  if (!input.success) return { error: text.errors.credentials, values }
  const { data, error } = await anonAuthClient().auth.signInWithPassword(input.data)
  // The password was right but the address was never confirmed: send a new code and go to where it is entered.
  if (error?.code === 'email_not_confirmed') return unconfirmed(input.data.email, formData)
  if (error || !data.session) return { error: text.errors.credentials, values }
  const { data: profile } = await apiGet('/me', { token: data.session.access_token })
  // The password was right, but the API would not accept the session (it is down, or it uses a different Supabase
  // project from the website). Saying so beats landing on a page that treats the person as signed out.
  if (!profile) return { error: accountError(), values }
  writeSession(await cookies(), data.session)
  const next = landingFor(profile.role, safeNext(formData.get('next'), ''))
  redirect(nextStep(profile, next))
}

const signUpMessage = (error) =>
  ({ user_already_exists: text.errors.exists, weak_password: text.errors.weak })[error.code] ??
  text.errors.generic

/**
 * The account exists and is signed in. A rental company's person then starts their company, which waits for the
 * admin's review, and goes to their console. If that could not be done (the API was down), they go to a page that asks
 * for the company again, so nobody is left with an account that is neither one thing nor the other.
 */
async function finishSignUp(session, user, next) {
  writeSession(await cookies(), session)
  const meta = user.user_metadata ?? {}
  if (meta.account_type !== 'operator') redirect(next || homeFor('customer'))
  const { error } = await apiSend('POST', '/me/operator', {
    token: session.access_token,
    body: { business_name: meta.business_name, phone: meta.phone },
  })
  redirect(error && error !== 'CONFLICT' ? '/auth/operator/company' : homeFor('operator'))
}

/**
 * Creates an account from a sign-up form. `names` are the fields to put back after a mistake, `extra` is added to what
 * Supabase keeps about the person. Where the project asks for email confirmation (production, and the local project), no
 * session comes back and the person is sent to enter the six-digit code that was emailed.
 */
async function submitSignUp(formData, { schema, names, extra = {} }) {
  const values = Object.fromEntries(names.map((name) => [name, field(formData, name)]))
  const input = schema.safeParse({
    ...values,
    password: field(formData, 'password'),
    confirm_password: field(formData, 'confirm_password'),
  })
  if (!input.success) return { errors: fieldErrors(input.error), values }
  const { password, confirm_password: _same, email, ...details } = input.data
  const { data, error } = await anonAuthClient().auth.signUp({
    email,
    password,
    options: { data: { ...details, ...extra } },
  })
  if (error) return { error: signUpMessage(error), values }
  if (!data.session) return goToCodePage(email, formData)
  return finishSignUp(data.session, data.user, safeNext(formData.get('next'), ''))
}

export async function signUpAction(_state, formData) {
  return submitSignUp(formData, { schema: signUpSchema, names: ['full_name', 'email'] })
}

/** A rental company's owner creates an account; the company is started once the email is confirmed. */
export async function operatorSignUpAction(_state, formData) {
  return submitSignUp(formData, {
    schema: operatorSignUpSchema,
    names: ['business_name', 'full_name', 'phone', 'email'],
    extra: { account_type: 'operator' },
  })
}

/** For someone already signed in as a customer: starts a company of their own. */
export async function registerCompanyAction(_state, formData) {
  const values = {
    business_name: field(formData, 'business_name'),
    phone: field(formData, 'phone'),
  }
  const input = registerOperatorSchema.safeParse({ ...values, phone: values.phone || undefined })
  if (!input.success) return { errors: fieldErrors(input.error), values }
  const token = readTokens(await cookies()).accessToken
  if (!token) redirect('/auth?next=/auth/operator/company')
  const { error } = await apiSend('POST', '/me/operator', { token, body: input.data })
  if (error && error !== 'CONFLICT') return { error: text.errors.generic, values }
  redirect(homeFor('operator'))
}

/** Checks the six-digit code from the sign-up email. A right code confirms the address and signs the person in. */
export async function verifyEmailAction(_state, formData) {
  const input = authCodeSchema.safeParse({ code: formData.get('code') })
  const store = await cookies()
  const email = readPendingEmail(store)
  if (!email) redirect('/auth/sign-up')
  if (!input.success) return { error: text.errors.otp }
  const { data, error } = await anonAuthClient().auth.verifyOtp({
    email,
    token: input.data.code,
    type: 'email',
  })
  if (error || !data.session) return { error: text.errors.otp }
  clearPendingEmail(store)
  return finishSignUp(data.session, data.user, safeNext(formData.get('next'), ''))
}

/** Sends the sign-up code again. Supabase limits how often; a refusal is shown as "wait a moment". */
export async function resendCodeAction() {
  const email = readPendingEmail(await cookies())
  if (!email) redirect('/auth/sign-up')
  const { error } = await anonAuthClient().auth.resend({ type: 'signup', email })
  return error ? { error: text.errors.tooSoon } : { status: 'sent', at: Date.now() }
}

/** Asks for a reset link. The answer is the same whether or not the address has an account, so it cannot be used to find out. */
export async function forgotPasswordAction(_state, formData) {
  const values = { email: field(formData, 'email') }
  const input = forgotPasswordSchema.safeParse(values)
  if (!input.success) return { errors: fieldErrors(input.error), values }
  await anonAuthClient().auth.resetPasswordForEmail(input.data.email)
  return { status: 'sent' }
}

/**
 * Uses the one-time link from an email. It is a button, not the link itself, because mail scanners open every link
 * in a message and would use it up before the person did.
 */
export async function confirmLinkAction(formData) {
  const type = field(formData, 'type')
  const tokenHash = field(formData, 'token_hash')
  if (!LINK_TYPES.includes(type) || !tokenHash) redirect(LINK_EXPIRED)
  const { data, error } = await anonAuthClient().auth.verifyOtp({ token_hash: tokenHash, type })
  if (error || !data.session) redirect(LINK_EXPIRED)
  writeSession(await cookies(), data.session)
  redirect(
    type === 'recovery' ? '/auth/reset' : safeNext(formData.get('next'), homeFor('customer')),
  )
}

const resetMessage = (error) =>
  ({ same_password: text.errors.sameAsOld, weak_password: text.errors.weak })[error.code] ??
  text.errors.generic

/** Saves the new password, then ends every session of the account, so the person signs in again with it. */
export async function resetPasswordAction(_state, formData) {
  const input = resetPasswordSchema.safeParse({ password: field(formData, 'password') })
  if (!input.success) return { errors: fieldErrors(input.error) }
  const store = await cookies()
  const client = await signedInClient(readTokens(store))
  if (!client) redirect(LINK_EXPIRED)
  const { error } = await client.auth.updateUser({ password: input.data.password })
  if (error) return { error: resetMessage(error) }
  await client.auth.signOut({ scope: 'global' }).catch(() => {})
  clearSession(store)
  redirect('/auth?notice=password-changed')
}

/**
 * Step two: the code from the authenticator app. `pickFactorId` says which factor to check it against. The session in
 * the cookies is replaced by the one the client ends with, right or wrong, because the client may have renewed it.
 */
async function completeSecondFactor(formData, pickFactorId) {
  const input = authCodeSchema.safeParse({ code: formData.get('code') })
  if (!input.success) return { error: text.errors.code }
  const store = await cookies()
  const next = safeNext(formData.get('next'), '/')
  const client = await signedInClient(readTokens(store))
  if (!client) redirect('/auth')
  const factorId = await pickFactorId(client)
  if (!factorId) redirect(`/auth/enrol?next=${encodeURIComponent(next)}`)
  const isRight = await verifyCode(client, { factorId, code: input.data.code })
  writeSession(store, await currentSession(client))
  if (!isRight) return { error: text.errors.code }
  redirect(next)
}

export async function verifyAction(_state, formData) {
  return completeSecondFactor(formData, async (client) => (await findVerifiedFactor(client))?.id)
}

export async function confirmEnrolAction(_state, formData) {
  return completeSecondFactor(formData, async () => formData.get('factorId'))
}

/**
 * Starts setting up the authenticator and returns what to show: the picture, the key as text, and the setup's id.
 * It is asked for once, by the page's browser side, and not while the page is drawn: drawing it again (which happens
 * after every wrong code) would make a new secret each time, and the one already scanned would stop working.
 */
export async function startEnrolAction() {
  const setup = await startEnrol(readTokens(await cookies()))
  return setup ?? { error: true }
}

export async function signOutAction() {
  const store = await cookies()
  const client = await signedInClient(readTokens(store))
  // Ending the session at Supabase is best effort: the cookies are cleared either way.
  await client?.auth.signOut({ scope: 'local' }).catch(() => {})
  clearSession(store)
  redirect('/')
}
