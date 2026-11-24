import { BOOKING_STATUSES } from '@rent-a-car/shared'
import AdminPage from '@/components/AdminPage'
import Alert from '@/components/Alert'
import AdminBookingList from '@/components/AdminBookingList'
import AdminMoreLink from '@/components/AdminMoreLink'
import AdminFilters from '@/components/AdminFilters'
import { copy } from '@/copy/en'
import { adminGet, getClassNames, requireAdmin } from '@/lib/admin'
import { nextPageHref } from '@/lib/admin-format'

const text = copy.admin.bookings

export const metadata = { title: text.title }

const OPTIONS = [
  { value: '', label: text.all },
  ...BOOKING_STATUSES.map((value) => ({ value, label: copy.status[value] })),
]

export default async function AdminBookingsPage({ searchParams }) {
  const { status, cursor } = await searchParams
  const { token } = await requireAdmin()
  const filter = BOOKING_STATUSES.includes(status) ? status : undefined
  const [list, classNames] = await Promise.all([
    adminGet('/staff/bookings', token, { status: filter, cursor }),
    getClassNames(),
  ])
  const older = nextPageHref(
    '/admin/bookings',
    filter ? { status: filter } : {},
    list.meta?.next_cursor,
  )
  return (
    <AdminPage title={text.title} subtitle={text.subtitle}>
      <AdminFilters base="/admin/bookings" name="status" current={filter} options={OPTIONS} />
      {list.error && <Alert tone="error" title={copy.admin.loadError} />}
      {list.data?.length === 0 && <p className="text-body text-label-2">{text.empty}</p>}
      {list.data?.length > 0 && <AdminBookingList bookings={list.data} classNames={classNames} />}
      <AdminMoreLink href={older}>{text.more}</AdminMoreLink>
    </AdminPage>
  )
}
