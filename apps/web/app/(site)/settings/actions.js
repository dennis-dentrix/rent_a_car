'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { authCodeSchema, changePasswordSchema, updateProfileSchema } from '@rent-a-car/shared'
import { copy } from '@/copy/en'
import { apiSend } from '@/lib/api'
import { clearSession, readTokens, writeSession } from '@/lib/auth/cookies'
import { fieldErrors } from '@/lib/auth/fields'
import { findVerifiedFactor, verifyCode } from '@/lib/auth/mfa'
import { isSecondFactorRequired } from '@/lib/auth/roles'
import { getCurrentUser } from '@/lib/auth/session'
import { anonAuthClient, currentSession, signedInClient } from '@/lib/auth/supabase'

const text = copy.settings
const authText = copy.auth

const field = (formData, name) => formData.get(name) ?? ''
const call = async (method, path, body) =>
  apiSend(method, path, { token: readTokens(await cookies()).accessToken, body })

/** Saves the person's name and phone. */
export async function updateProfileAction(_state, formData) {
  const values = { full_name: field(formData, 'full_name'), phone: field(formData, 'phone') }
  const input = updateProfileSchema.safeParse({
    full_name: values.full_name,
    ...(values.phone.trim() ? { phone: values.phone } : {}),
  })
  if (!input.success) return { errors: fieldErrors(input.error), values }
  const { error, details } = await call('PATCH', '/me', input.data)
  if (details?.phone) return { errors: { phone: details.phone }, values }
  if (error) return { error: authText.errors.generic, values }
  return { status: 'saved', values }
}

/** Turns offers and news on or off. Answers { isOn } so the switch can show what the server kept. */
export async function setMarketingAction(isOn) {
  const { data, error } = await call('PATCH', '/me', { marketing_opt_in: Boolean(isOn) })
  return error ? { error } : { isOn: data.marketing_opt_in }
}

const passwordMessage = (error) =>
  ({ same_password: authText.errors.sameAsOld, weak_password: authText.errors.weak })[error.code] ??
  authText.errors.generic

/**
 * Changes the password. The current one is checked first (a session left open on a shared computer must not be able
 * to take the account over), and every other device is signed out afterwards.
 */
export async function changePasswordAction(_state, formData) {
  const input = changePasswordSchema.safeParse({
    current_password: field(formData, 'current_password'),
    password: field(formData, 'password'),
    confirm_password: field(formData, 'confirm_password'),
  })
  if (!input.success) return { errors: fieldErrors(input.error) }
  const user = await getCurrentUser()
  if (!user) redirect('/auth?next=/settings')
  const check = await anonAuthClient().auth.signInWithPassword({
    email: user.profile.email,
    password: input.data.current_password,
  })
  if (check.error) return { errors: { current_password: text.security.password.wrongCurrent } }
  const store = await cookies()
  const client = await signedInClient(readTokens(store))
  if (!client) redirect('/auth?next=/settings')
  const { error } = await client.auth.updateUser({ password: input.data.password })
  if (error) return { error: passwordMessage(error) }
  await client.auth.signOut({ scope: 'others' }).catch(() => {})
  writeSession(store, await currentSession(client))
  return { status: 'saved' }
}

/**
 * Turns the authenticator app off, after a code proves it is its owner. Staff and admin cannot: their role requires it.
 * Supabase only removes a factor from a session that has used it, which a right code here makes sure of.
 */
export async function disableSecondFactorAction(_state, formData) {
  const user = await getCurrentUser()
  if (!user || isSecondFactorRequired(user.profile.role)) return { error: authText.errors.generic }
  const input = authCodeSchema.safeParse({ code: formData.get('code') })
  if (!input.success) return { error: authText.errors.code }
  const store = await cookies()
  const client = await signedInClient(readTokens(store))
  if (!client) redirect('/auth?next=/settings')
  const factor = await findVerifiedFactor(client)
  if (!factor) return { status: 'saved' }
  if (!(await verifyCode(client, { factorId: factor.id, code: input.data.code }))) {
    writeSession(store, await currentSession(client))
    return { error: authText.errors.code }
  }
  const { error } = await client.auth.mfa.unenroll({ factorId: factor.id })
  writeSession(store, await currentSession(client))
  return error ? { error: authText.errors.generic } : { status: 'saved' }
}

/** Ends every session of the account, on every device including this one. */
export async function signOutEverywhereAction() {
  const store = await cookies()
  const client = await signedInClient(readTokens(store))
  await client?.auth.signOut({ scope: 'global' }).catch(() => {})
  clearSession(store)
  redirect('/auth')
}
