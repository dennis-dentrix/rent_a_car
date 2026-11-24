'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { reviewOperatorSchema } from '@rent-a-car/shared'
import { copy } from '@/copy/en'
import { apiSend } from '@/lib/api'
import { readTokens } from '@/lib/auth/cookies'

const text = copy.auth.adminOperators

/** An admin approves or rejects a company. A rejection must say why, and the API checks the move is allowed. */
export async function reviewOperatorAction(_state, formData) {
  const reason = (formData.get('reason') ?? '').trim()
  const input = reviewOperatorSchema.safeParse({
    to: formData.get('to'),
    ...(reason ? { reason } : {}),
  })
  if (!input.success) return { error: text.errors.reason }
  const token = readTokens(await cookies()).accessToken
  const { error } = await apiSend('POST', `/admin/operators/${formData.get('id')}/review`, {
    token,
    body: input.data,
  })
  if (error) return { error: text.errors.generic }
  revalidatePath('/admin/operators')
  return { status: 'done' }
}
