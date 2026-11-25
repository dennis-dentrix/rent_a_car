import Link from 'next/link'
import { redirect } from 'next/navigation'
import { CalendarDays, Car, Settings } from 'lucide-react'
import Alert from '@/components/Alert'
import Avatar from '@/components/Avatar'
import BookingList from '@/components/BookingList'
import MyInspections from '@/components/MyInspections'
import NextHire from '@/components/NextHire'
import QuickActions from '@/components/QuickActions'
import SignOutForm from '@/components/SignOutForm'
import { copy } from '@/copy/en'
import { apiGet } from '@/lib/api'
import { avatarUrl } from '@/lib/avatar'
import { homeFor } from '@/lib/auth/roles'
import { requireRole } from '@/lib/auth/session'
import { getClasses } from '@/lib/catalogue'
import { nextHire } from '@/lib/renter-dashboard'

const text = copy.renterHome
const RECENT = 3

export const metadata = { title: text.meta.title, robots: { index: false, follow: false } }

const ACTIONS = [
  { href: '/cars', label: text.actions.cars, icon: Car },
  { href: '/account/bookings', label: text.actions.bookings, icon: CalendarDays },
  { href: '/settings', label: text.actions.settings, icon: Settings },
]

function Greeting({ profile }) {
  return (
    <header className="flex items-center gap-4">
      <Avatar name={profile.full_name} src={avatarUrl(profile.avatar_path)} size={56} />
      <div className="min-w-0">
        <h1 className="text-display">{text.greeting(profile.full_name)}</h1>
        <p className="truncate text-callout text-label-2">{profile.email}</p>
      </div>
    </header>
  )
}

function Recent({ bookings, names }) {
  if (!bookings.length) return null
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-headline">{text.recent}</h2>
        <Link href="/account/bookings" className="text-callout font-semibold text-primary">
          {text.seeAll}
        </Link>
      </div>
      <BookingList bookings={bookings.slice(0, RECENT)} names={names} />
    </section>
  )
}

// A renter's dashboard. A company's person and the admin have their own, so they are sent to it.
export default async function AccountPage() {
  const { profile, token } = await requireRole(null, '/account')
  const home = homeFor(profile.role)
  if (home !== '/account') redirect(home)
  const [bookings, classes, reports] = await Promise.all([
    apiGet('/bookings', { token }),
    getClasses(),
    apiGet('/renter/inspections', { token }),
  ])
  const names = new Map((classes.data ?? []).map((item) => [item.id, item.name]))
  const next = nextHire(bookings.data ?? [])
  return (
    <div className="stagger mx-auto flex max-w-lg flex-col gap-6">
      <Greeting profile={profile} />
      {bookings.error ? (
        <Alert tone="error" title={copy.admin.loadError} />
      ) : (
        <NextHire booking={next} carType={names.get(next?.class_id)} />
      )}
      <QuickActions actions={ACTIONS} />
      <Recent bookings={bookings.data ?? []} names={names} />
      <MyInspections reports={reports.data ?? []} />
      <SignOutForm />
    </div>
  )
}
