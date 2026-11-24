import AdminBookingList from '@/components/AdminBookingList'
import AdminFilters from '@/components/AdminFilters'
import AdminMoreLink from '@/components/AdminMoreLink'
import AdminPage from '@/components/AdminPage'
import Alert from '@/components/Alert'
import { BOOKING_STATUSES } from '@rent-a-car/shared'
import { copy } from '@/copy/en'
import { adminGet } from '@/lib/admin'
import { nextPageHref } from '@/lib/admin-format'

const OPTIONS = [
  { value: '', label: copy.admin.bookings.all },
  ...BOOKING_STATUSES.map((value) => ({ value, label: copy.status[value] })),
]

/**
 * The list of bookings with its status filter and older pages, for the admin (all bookings) or an operator (its own).
 * `listPath` is the API list, `basePath` this page's address, and `labels` is { title, subtitle, empty }.
 */
export default async function BookingsScreen({
  listPath,
  basePath,
  labels,
  token,
  query,
  classNames,
}) {
  const { status, cursor } = query
  const filter = BOOKING_STATUSES.includes(status) ? status : undefined
  const list = await adminGet(listPath, token, { status: filter, cursor })
  const older = nextPageHref(basePath, filter ? { status: filter } : {}, list.meta?.next_cursor)
  return (
    <AdminPage title={labels.title} subtitle={labels.subtitle}>
      <AdminFilters base={basePath} name="status" current={filter} options={OPTIONS} />
      {list.error && <Alert tone="error" title={copy.admin.loadError} />}
      {list.data?.length === 0 && <p className="text-body text-label-2">{labels.empty}</p>}
      {list.data?.length > 0 && (
        <AdminBookingList bookings={list.data} classNames={classNames} basePath={basePath} />
      )}
      <AdminMoreLink href={older}>{copy.admin.bookings.more}</AdminMoreLink>
    </AdminPage>
  )
}
