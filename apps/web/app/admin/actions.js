'use server'

import { revalidatePath } from 'next/cache'
import {
  assignBookingSchema,
  inviteStaffSchema,
  reviewDocumentSchema,
  updateBookingStatusSchema,
  updateStaffSchema,
} from '@rent-a-car/shared'
import { copy } from '@/copy/en'
import { adminSend } from '@/lib/admin-send'

const text = copy.admin

const field = (formData, name) => (formData.get(name) ?? '').toString().trim()
const withoutEmpty = (values) => Object.fromEntries(Object.entries(values).filter(([, v]) => v))

/** Moves a booking to its next status. The API checks the move is allowed, and that a note is given where one is needed. */
export async function bookingStatusAction(_state, formData) {
  const id = field(formData, 'id')
  const input = updateBookingStatusSchema.safeParse(
    withoutEmpty({ to_status: field(formData, 'to_status'), note: field(formData, 'note') }),
  )
  if (!input.success) return { error: text.bookings.errors.note }
  const result = await adminSend('PATCH', `/staff/bookings/${id}/status`, input.data)
  if (result.error) return result
  revalidatePath(`/admin/bookings/${id}`)
  revalidatePath('/admin')
  return { status: 'done' }
}

/** Verifies an uploaded document, or rejects it with a reason the customer can act on. */
export async function documentReviewAction(_state, formData) {
  const input = reviewDocumentSchema.safeParse(
    withoutEmpty({
      status: field(formData, 'status'),
      rejection_reason: field(formData, 'rejection_reason'),
    }),
  )
  if (!input.success) return { error: text.documents.errors.reason }
  const result = await adminSend('PATCH', `/staff/documents/${field(formData, 'id')}`, input.data)
  if (result.error) return result
  revalidatePath('/admin/documents')
  revalidatePath('/admin')
  return { status: 'done' }
}

/** Opens a stored identity file. The reason is required and goes into the access log. */
export async function documentLinkAction(_state, formData) {
  const reason = field(formData, 'reason')
  if (reason.length < 3) return { error: text.documents.errors.viewReason }
  const id = field(formData, 'id')
  const result = await adminSend(
    'GET',
    `/staff/documents/${id}/url?reason=${encodeURIComponent(reason)}`,
  )
  return result.error ? result : { url: result.data.url, at: Date.now() }
}

/** Gives a person the staff or admin role, sending an invite when they have no account yet. */
export async function inviteStaffAction(_state, formData) {
  const values = { email: field(formData, 'email'), full_name: field(formData, 'full_name') }
  const input = inviteStaffSchema.safeParse({ ...values, role: field(formData, 'role') })
  if (!input.success) return { error: text.team.errors.email, values }
  const result = await adminSend('POST', '/admin/staff', input.data)
  if (result.error) return { ...result, values }
  revalidatePath('/admin/team')
  return { status: 'invited' }
}

/** Changes a team member's role, or switches their access off or on. */
export async function updateStaffAction(_state, formData) {
  const role = field(formData, 'role')
  const active = field(formData, 'active')
  const input = updateStaffSchema.safeParse({
    ...(role && { role }),
    ...(active && { active: active === 'true' }),
  })
  if (!input.success) return { error: text.team.errors.generic }
  const result = await adminSend('PATCH', `/admin/staff/${field(formData, 'id')}`, input.data)
  if (result.error) return result
  revalidatePath('/admin/team')
  return { status: 'done' }
}

/** Puts a vehicle on a booking. The database refuses a car that is busy on those dates, and the form says so. */
export async function assignVehicleAction(_state, formData) {
  const id = field(formData, 'id')
  const input = assignBookingSchema.safeParse({ vehicle_id: field(formData, 'vehicle_id') })
  if (!input.success) return { error: copy.adminFleet.assign.failed }
  const result = await adminSend('POST', `/staff/bookings/${id}/assign`, input.data)
  if (result.error) return { error: copy.adminFleet.assign.failed }
  revalidatePath(`/admin/bookings/${id}`)
  return { status: 'done' }
}
