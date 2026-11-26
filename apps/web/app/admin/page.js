import Link from 'next/link'
import { nairobiDate } from '@carvo/shared'
import AdminAttention from '@/components/AdminAttention'
import AdminAuditList from '@/components/AdminAuditList'
import AdminBookingList from '@/components/AdminBookingList'
import AdminPage from '@/components/AdminPage'
import BookingOutcomes from '@/components/BookingOutcomes'
import Alert from '@/components/Alert'
import Panel from '@/components/Panel'
import StatTiles from '@/components/StatTiles'
import { copy } from '@/copy/en'
import { adminGet, getClassNames, requireAdmin } from '@/lib/admin'
import { adminTiles } from '@/lib/admin-tiles'

const text = copy.admin.overview

export const metadata = { title: copy.admin.meta.title }

const PICKUP_STATUSES = ['confirmed', 'ready']

// The first page of the admin: what is waiting, what moves today, and the latest changes. Nothing else.
export default async function AdminOverviewPage() {
  const { token, profile } = await requireAdmin()
  const [overview, pickups, audit, classNames, outcomes] = await Promise.all([
    adminGet('/admin/overview', token),
    adminGet('/staff/bookings', token, { date: nairobiDate(new Date()) }),
    adminGet('/admin/audit', token, { limit: 5 }),
    getClassNames(),
    adminGet('/admin/booking-outcomes', token),
  ])
  if (overview.error) return <Alert tone="error" title={copy.admin.loadError} />
  const dueToday = (pickups.data ?? []).filter((b) => PICKUP_STATUSES.includes(b.status))
  return (
    <AdminPage title={text.title} subtitle={text.greeting(profile.full_name)}>
      <StatTiles title={text.todayTitle} items={adminTiles(overview.data)} />
      <div className="grid items-start gap-5 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-5">
          <PickupsPanel bookings={dueToday} classNames={classNames} />
          <BookingOutcomes weeks={outcomes.data ?? []} />
          <RecentPanel entries={audit.data ?? []} />
        </div>
        <AdminAttention overview={overview.data} />
      </div>
    </AdminPage>
  )
}

function PickupsPanel({ bookings, classNames }) {
  return (
    <Panel title={text.pickupsTitle} isFlush>
      {bookings.length ? (
        <AdminBookingList bookings={bookings} classNames={classNames} />
      ) : (
        <p className="px-5 pb-8 pt-4 text-center text-cell text-label-2">{text.noPickups}</p>
      )}
    </Panel>
  )
}

function RecentPanel({ entries }) {
  const seeAll = (
    <Link
      href="/admin/audit"
      className="inline-flex min-h-touch items-center text-meta font-bold text-primary"
    >
      {text.seeAll}
    </Link>
  )
  return (
    <Panel title={text.recentTitle} action={seeAll}>
      <AdminAuditList entries={entries} />
    </Panel>
  )
}
