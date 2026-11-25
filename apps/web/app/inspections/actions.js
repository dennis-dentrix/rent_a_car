'use server'

import { revalidatePath } from 'next/cache'
import { adminSend } from '@/lib/admin-send'

// Handover inspections, for a rental company and for a renter. The API decides who may see or sign each report.
const SIGNING = {
  company: { path: (id) => `/operator/inspections/${id}/sign`, page: '/console/inspections' },
  renterHere: {
    path: (id) => `/operator/inspections/${id}/renter-sign`,
    page: '/console/inspections',
  },
  account: { path: (id) => `/renter/inspections/${id}/sign`, page: '/account/inspections' },
}

// The reason worth showing: the message of the field the API refused, or else its general one.
const reason = (result) =>
  result.error ? { error: Object.values(result.fields ?? {})[0] ?? result.error } : result

const send = async (method, path, body) => reason(await adminSend(method, path, body))
const clean = (id) => encodeURIComponent(id)

export async function requestInspectionUploadsAction(bookingId, files) {
  return send('POST', `/operator/bookings/${clean(bookingId)}/inspection-uploads`, { files })
}

export async function createInspectionAction(report) {
  const result = await send('POST', '/operator/inspections', report)
  if (!result.error) revalidatePath(`/console/bookings/${report.booking_id}`)
  return result
}

export async function signInspectionAction(side, id, body) {
  const { path, page } = SIGNING[side]
  const result = await send('POST', path(clean(id)), body)
  if (!result.error) revalidatePath(`${page}/${id}`)
  return result
}

export async function sendRenterCodeAction(id) {
  return send('POST', `/operator/inspections/${clean(id)}/renter-code`)
}

/** A ten-minute link to the sealed PDF. `side` is 'account' for the renter, otherwise the company. */
export async function reportLinkAction(side, id) {
  const area = side === 'account' ? 'renter' : 'operator'
  return send('GET', `/${area}/inspections/${clean(id)}/report`)
}
