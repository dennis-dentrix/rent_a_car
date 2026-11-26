import { redirect } from 'next/navigation'
import { apiGet } from '@/lib/api'
import { homeFor } from '@/lib/auth/roles'
import { requireRole } from '@/lib/auth/session'
import { renterLanding } from '@/lib/renter-dashboard'

export const metadata = { robots: { index: false, follow: false } }

// The address of "my account". It is not a page: it sends each person on to what they came for.
export default async function AccountPage() {
  const { profile, token } = await requireRole(null, '/account')
  const home = homeFor(profile.role)
  if (home !== '/account') redirect(home)
  const { data } = await apiGet('/bookings', { token })
  redirect(renterLanding(data ?? []))
}
