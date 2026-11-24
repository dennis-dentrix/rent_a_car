'use server'

import { revalidatePath } from 'next/cache'
import { copy } from '@/copy/en'
import { adminSend } from '@/lib/admin-send'
import { buildBody, resourcePaths } from '@/lib/admin-resources'
import { registryFor } from '@/lib/resource-scopes'

const text = copy.adminSetup

/**
 * Adds a record, or saves changes to one when `id` is given. The server checks every field; a refusal comes back with
 * each field's own message so the form can show it where it belongs. Nothing is deleted from here.
 */
export async function saveResourceAction(_state, formData) {
  const resource = String(formData.get('resource') ?? '')
  const id = String(formData.get('id') ?? '')
  const scope = String(formData.get('scope') ?? 'admin')
  const definition = registryFor(scope)[resource]
  if (!definition) return { error: text.errors.generic }
  const parent = String(formData.get('parent') ?? '')
  const paths = resourcePaths(resource, definition, scope)
  const body = buildBody(definition.fields, formData, Boolean(id))
  const result = id
    ? await adminSend('PATCH', paths.edit(id), body)
    : await adminSend('POST', paths.create(parent), body)
  if (result.error) return { error: text.errors.generic, fields: result.fields, at: Date.now() }
  revalidatePath(paths.page(parent))
  return { status: id ? 'saved' : 'added', at: Date.now() }
}
