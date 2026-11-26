'use server'

import { revalidatePath } from 'next/cache'
import { copy } from '@/copy/en'
import { adminSend } from '@/lib/admin-send'

const field = (formData, name) => String(formData.get(name) ?? '').trim()
const PAGE = '/console/calendar'

async function change(method, path, body) {
  const result = await adminSend(method, path, body)
  if (result.error) return result
  revalidatePath(PAGE)
  return { status: 'done', sentAt: Date.now() }
}

export async function blockDatesAction(_state, formData) {
  const start = field(formData, 'start_date')
  const end = field(formData, 'end_date')
  if (!start || !end) return { error: copy.calendar.needDates }
  const note = field(formData, 'note')
  return change('POST', '/operator/blocks', {
    vehicle_id: field(formData, 'vehicle_id'),
    start_date: start,
    end_date: end,
    ...(note ? { note } : {}),
  })
}

export async function removeBlockAction(_state, formData) {
  return change('DELETE', `/operator/blocks/${encodeURIComponent(field(formData, 'id'))}`)
}
