import Link from 'next/link'
import AdminAttention from '@/components/AdminAttention'
import AdminBookingList from '@/components/AdminBookingList'
import AdminToday from '@/components/AdminToday'
import Alert from '@/components/Alert'
import LargeTitle from '@/components/LargeTitle'
import AdminAuditList from '@/components/AdminAuditList'
import { nairobiDate } from '@carvo/shared'
import { copy } from '@/copy/en'
import { adminGet, getClassNames, requireAdmin } from '@/lib/admin'

const text = copy.admin.overview

export const metadata = { title: copy.admin.meta.title }

const PICKUP_STATUSES = ['confirmed', 'ready']

// The first page of the admin: what is waiting, what moves today, and the latest changes. Nothing else.
export default async function AdminPage() {
  const { token, profile } = await requireAdmin()
  const today = nairobiDate(new Date())
  const [overview, pickups, audit, classNames] = await Promise.all([
    adminGet('/admin/overview', token),
    adminGet('/staff/bookings', token, { date: today }),
    adminGet('/admin/audit', token, { limit: 5 }),
    getClassNames(),
  ])
  if (overview.error) return <Alert tone="error" title={copy.admin.loadError} />
  const dueToday = (pickups.data ?? []).filter((b) => PICKUP_STATUSES.includes(b.status))
  return (
    <div className="flex flex-col gap-8">
      <LargeTitle subtitle={text.greeting(profile.full_name)}>{text.title}</LargeTitle>
      <AdminAttention overview={overview.data} />
      <AdminToday overview={overview.data} />
      <PickupsSection bookings={dueToday} classNames={classNames} />
      <RecentSection entries={audit.data ?? []} />
    </div>
  )
}

function PickupsSection({ bookings, classNames }) {
  return (
    <section aria-labelledby="pickups" className="flex flex-col gap-3">
      <h2 id="pickups" className="text-title-3">
        {text.pickupsTitle}
      </h2>
      {bookings.length ? (
        <AdminBookingList bookings={bookings} classNames={classNames} />
      ) : (
        <p className="text-body text-label-2">{text.noPickups}</p>
      )}
    </section>
  )
}

function RecentSection({ entries }) {
  return (
    <section aria-labelledby="recent" className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h2 id="recent" className="text-title-3">
          {text.recentTitle}
        </h2>
        <Link
          href="/admin/audit"
          className="text-callout font-medium text-primary underline underline-offset-2"
        >
          {text.seeAll}
        </Link>
      </div>
      <AdminAuditList entries={entries} />
    </section>
  )
}
