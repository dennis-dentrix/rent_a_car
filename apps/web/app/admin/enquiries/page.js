import AdminPage from '@/components/AdminPage'
import Alert from '@/components/Alert'
import AdminFilters from '@/components/AdminFilters'
import AdminMoreLink from '@/components/AdminMoreLink'
import InsetList from '@/components/InsetList'
import Badge from '@/components/Badge'
import { copy } from '@/copy/en'
import { adminGet, requireAdmin } from '@/lib/admin'
import { momentText, nextPageHref } from '@/lib/admin-format'

const text = copy.admin.enquiries

export const metadata = { title: text.title }

const OPTIONS = [
  { value: '', label: text.all },
  { value: 'open', label: text.open },
  { value: 'converted', label: text.converted },
]

const toItem = (enquiry) => ({
  id: enquiry.id,
  href: enquiry.converted_booking_id
    ? `/admin/bookings/${enquiry.converted_booking_id}`
    : undefined,
  title: enquiry.name || enquiry.email || enquiry.phone || text.noName,
  detail: [momentText(enquiry.created_at), enquiry.message].filter(Boolean).join(' · '),
  trailing: <Badge>{text.source[enquiry.source]}</Badge>,
})

export default async function AdminEnquiriesPage({ searchParams }) {
  const { status, cursor } = await searchParams
  const { token } = await requireAdmin()
  const filter = ['open', 'converted'].includes(status) ? status : undefined
  const { data, meta, error } = await adminGet('/staff/enquiries', token, {
    status: filter,
    cursor,
  })
  const older = nextPageHref(
    '/admin/enquiries',
    filter ? { status: filter } : {},
    meta?.next_cursor,
  )
  return (
    <AdminPage title={text.title} subtitle={text.subtitle}>
      <AdminFilters base="/admin/enquiries" name="status" current={filter} options={OPTIONS} />
      {error && <Alert tone="error" title={copy.admin.loadError} />}
      {data?.length === 0 && <p className="text-body text-label-2">{text.empty}</p>}
      {data?.length > 0 && <InsetList items={data.map(toItem)} />}
      <AdminMoreLink href={older}>{copy.admin.bookings.more}</AdminMoreLink>
    </AdminPage>
  )
}
