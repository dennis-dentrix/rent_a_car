'use server'

import { revalidatePath } from 'next/cache'
import { exchangeRateSchema } from '@rent-a-car/shared'
import { copy } from '@/copy/en'
import { adminSend } from '@/lib/admin-send'

const text = copy.adminSetup.settings

/** Saves one setting. The server checks the value is the kind that setting takes. */
export async function updateSettingAction(key, value) {
  const result = await adminSend('PUT', `/admin/settings/${encodeURIComponent(key)}`, { value })
  if (result.error) return { error: text.failed }
  revalidatePath('/admin/settings')
  return { ok: true }
}

/** Sets the dollar rate used by quotes made from now on. */
export async function setRateAction(_state, formData) {
  const input = exchangeRateSchema.safeParse({
    rate_to_kes: Number(formData.get('rate_to_kes')),
    rate_date: String(formData.get('rate_date') ?? ''),
  })
  if (!input.success) return { error: text.failed }
  const result = await adminSend('PUT', '/admin/exchange-rates/USD', input.data)
  if (result.error) return { error: text.failed }
  revalidatePath('/admin/settings')
  return { status: 'saved', at: Date.now() }
}
