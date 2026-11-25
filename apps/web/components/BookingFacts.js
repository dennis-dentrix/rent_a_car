import { formatMoney } from '@carvo/shared'
import InsetList from '@/components/InsetList'
import { copy } from '@/copy/en'
import { momentText, personName } from '@/lib/admin-format'

const text = copy.admin.bookings

const facts = (booking, className) => [
  { id: 'customer', title: text.customer, detail: personName(booking.customer) },
  {
    id: 'vehicle',
    title: text.vehicle,
    detail: booking.vehicle
      ? `${booking.vehicle.make} ${booking.vehicle.model} · ${booking.vehicle.registration}`
      : `${className ?? ''} ${text.noVehicle}`.trim(),
  },
  {
    id: 'dates',
    title: text.dates,
    detail: `${momentText(booking.start_at)} → ${momentText(booking.end_at)}`,
  },
  { id: 'total', title: text.total, detail: formatMoney(booking.total_kes) },
  { id: 'balance', title: text.balance, detail: formatMoney(booking.balance_kes) },
]

/** Who, what car, when, and how much, as one list. Shared by the admin's and the operator's booking pages. */
export default function BookingFacts({ booking, className }) {
  return <InsetList items={facts(booking, className)} />
}

/** The booking's status history. */
export function BookingTimeline({ events }) {
  const items = events.map((event, index) => ({
    id: `${index}-${event.created_at}`,
    title: copy.status[event.to_status],
    detail: [momentText(event.created_at), event.actor?.full_name, event.note]
      .filter(Boolean)
      .join(' · '),
  }))
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-section">{text.history}</h2>
      <InsetList items={items} />
    </section>
  )
}
