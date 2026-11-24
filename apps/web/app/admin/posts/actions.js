'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { copy } from '@/copy/en'
import { apiSend } from '@/lib/api'
import { readTokens } from '@/lib/auth/cookies'

const text = copy.auth.adminPosts

// Everything the guide editor asks the server to do. The browser cannot call the API itself (the session token is in a
// cookie it cannot read), so each step goes through here. Every answer is { data } or { error, message, details }.
const call = async (method, path, body) =>
  apiSend(method, path, { token: readTokens(await cookies()).accessToken, body })

/** Starts a new guide as a draft with just a title, then opens it for writing. */
export async function createPostAction(_state, formData) {
  const title = (formData.get('title') ?? '').trim()
  if (!title) return { error: text.errors.title }
  const { data, error } = await call('POST', '/admin/posts', { title })
  if (error) return { error: error === 'CONFLICT' ? text.errors.exists : text.errors.generic }
  redirect(`/admin/posts/${data.id}`)
}

/** Saves the text of a guide, and publishes or unpublishes it when `status` is part of the change. */
export async function savePostAction(id, changes) {
  return call('PATCH', `/admin/posts/${id}`, changes)
}

/** Deletes a guide and its pictures, then goes back to the list. */
export async function deletePostAction(id) {
  const { error } = await call('DELETE', `/admin/posts/${id}`)
  if (error) return { error }
  redirect('/admin/posts')
}

/** A link the browser can send one picture to. */
export async function requestImageUploadAction(id, declaration) {
  return call('POST', `/admin/posts/${id}/image-uploads`, declaration)
}

/** Saves a picture once it has been sent, with its alt text. */
export async function addImageAction(id, image) {
  return call('POST', `/admin/posts/${id}/images`, image)
}

/** Changes a picture's description or caption. */
export async function updateImageAction(id, imageId, changes) {
  return call('PATCH', `/admin/posts/${id}/images/${imageId}`, changes)
}

export async function removeImageAction(id, imageId) {
  return call('DELETE', `/admin/posts/${id}/images/${imageId}`)
}
