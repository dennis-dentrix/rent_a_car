import InsetList from '@/components/InsetList'
import StatusBadge from '@/components/StatusBadge'
import { copy } from '@/copy/en'
import { momentText } from '@/lib/admin-format'

/** A renter's bookings as rows, each named after its car type. `names` maps a type's id to its name. */
export default function BookingList({ bookings, names }) {
  const items = bookings.map((booking) => ({
    id: booking.id,
    href: `/account/bookings/${booking.id}`,
    title: `${names.get(booking.class_id) ?? booking.reference} · ${booking.reference}`,
    detail: momentText(booking.start_at),
    preview: booking.has_news ? copy.alerts.updated : '',
    isUnread: booking.has_news,
    trailing: <StatusBadge status={booking.status} />,
  }))
  return <InsetList items={items} />
}
