import { formatMoney } from '@carvo/shared'
import DataTable from '@/components/DataTable'
import StatusBadge from '@/components/StatusBadge'
import { copy } from '@/copy/en'
import { momentText, personName } from '@/lib/admin-format'

const text = copy.admin.bookings

const columns = (classNames) => [
  {
    key: 'booking',
    label: text.title,
    render: (booking) => (
      <span className="flex flex-col">
        <span className="font-bold">{personName(booking.customer)}</span>
        <span className="num text-meta text-primary">{booking.reference}</span>
      </span>
    ),
  },
  {
    key: 'class',
    label: text.vehicle,
    render: (booking) => classNames.get(booking.class_id) ?? '—',
  },
  {
    key: 'dates',
    label: text.dates,
    render: (booking) => (
      <span className="num flex flex-col">
        <span>{momentText(booking.start_at)}</span>
        <span className="text-meta text-label-2">{text.handover[booking.handover_type]}</span>
      </span>
    ),
  },
  {
    key: 'total',
    label: text.total,
    isEnd: true,
    render: (booking) => <span className="font-bold">{formatMoney(booking.total_kes)}</span>,
  },
  {
    key: 'status',
    label: copy.consoleUi.fleet.status,
    render: (b) => <StatusBadge status={b.status} />,
  },
]

/** Bookings as a table: who, which class, when, how much, and the status. Each row opens the booking. */
export default function AdminBookingList({ bookings, classNames, basePath = '/admin/bookings' }) {
  return (
    <DataTable
      columns={columns(classNames)}
      rows={bookings}
      getRowId={(booking) => booking.id}
      getRowHref={(booking) => `${basePath}/${booking.id}`}
    />
  )
}
