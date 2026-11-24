import InsetList from '@/components/InsetList'
import StatusBadge from '@/components/StatusBadge'
import { copy } from '@/copy/en'
import { momentText, personName } from '@/lib/admin-format'

const text = copy.admin.bookings

/** Bookings as rows: reference and customer, when and where, and the status. Each opens the booking. */
export default function AdminBookingList({ bookings, classNames }) {
  const items = bookings.map((booking) => ({
    id: booking.id,
    href: `/admin/bookings/${booking.id}`,
    title: `${booking.reference} · ${personName(booking.customer)}`,
    detail: [
      classNames.get(booking.class_id),
      momentText(booking.start_at),
      text.handover[booking.handover_type],
    ]
      .filter(Boolean)
      .join(' · '),
    trailing: <StatusBadge status={booking.status} />,
  }))
  return <InsetList items={items} />
}
