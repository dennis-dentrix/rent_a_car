'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { apiSend } from '@/lib/api'
import { readTokens } from '@/lib/auth/cookies'

// The person's own picture. Each step answers { data } or { error }.
const call = async (method, path, body) =>
  apiSend(method, path, { token: readTokens(await cookies()).accessToken, body })

/** A link the browser can send one picture to. */
export async function requestAvatarUploadAction(declaration) {
  return call('POST', '/me/avatar-upload', declaration)
}

/** Makes the picture that was just sent the person's own. */
export async function setAvatarAction(picture) {
  return call('PUT', '/me/avatar', picture)
}

export async function removeAvatarAction() {
  return call('DELETE', '/me/avatar')
}

/** A link the browser can send an ID or licence to. */
export async function requestDocumentAction(declaration) {
  return call('POST', '/documents', declaration)
}

/** Says the file has arrived, so it can be checked. */
export async function completeDocumentAction(documentId, bookingId) {
  const result = await call('POST', `/documents/${encodeURIComponent(documentId)}/complete`)
  if (!result.error) revalidatePath(`/account/bookings/${bookingId}`)
  return result
}

export async function signAgreementAction(bookingId, signature) {
  const path = `/bookings/${encodeURIComponent(bookingId)}/agreement/sign`
  const result = await call('POST', path, signature)
  if (!result.error) revalidatePath(`/account/bookings/${bookingId}`)
  return result
}
