import { AppError } from '../lib/errors.js'
import { unwrap } from '../lib/supabase.js'

const findBy = async (admin, column, value) =>
  unwrap(await admin.from('profiles').select('id').eq(column, value).maybeSingle())

async function createCustomer(admin, { full_name, phone, email }) {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { full_name },
  })
  if (error)
    throw new AppError('CONFLICT', { message: 'An account with that email already exists.' })
  // The sign-up trigger created the profile; add the phone number to it.
  unwrap(await admin.from('profiles').update({ phone }).eq('id', data.user.id))
  return data.user.id
}

/**
 * The customer's profile id for a booking made by staff. An existing customer is matched by email or
 * phone; otherwise an account is created with no password, which the customer can claim later by
 * resetting it. Needs the service role because it creates an auth user.
 */
export async function findOrCreateCustomer(admin, customer) {
  const details = { ...customer, email: customer.email.toLowerCase() }
  const byEmail = await findBy(admin, 'email', details.email)
  const byPhone = await findBy(admin, 'phone', details.phone)
  if (byEmail && byPhone && byEmail.id !== byPhone.id) {
    throw new AppError('VALIDATION_FAILED', {
      message: 'That email and phone number belong to two different customers.',
    })
  }
  return (byEmail ?? byPhone)?.id ?? createCustomer(admin, details)
}
