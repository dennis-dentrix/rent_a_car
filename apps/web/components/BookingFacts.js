import { formatMoney } from '@rent-a-car/shared'
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
      <h2 className="text-title-3">{text.history}</h2>
      <InsetList items={items} />
    </section>
  )
}

function MoveSection({ booking }) {
  return (
    <section className="rounded-card bg-bg-grouped p-4">
      <h2 className="text-headline">{text.moveTo}</h2>
      {booking.next_statuses.length ? (
        <AdminDecision
          action={bookingStatusAction}
          id={booking.id}
          answerName="to_status"
          noteName="note"
          noteLabel={text.noteLabel}
          answers={moves(booking)}
        />
      ) : (
        <p className="mt-2 text-callout text-label-2">{text.noMoves}</p>
      )}
    </section>
  )
}

function AssignSection({ booking, vehicles }) {
  if (!canAssign(booking)) return null
  return (
    <section className="rounded-card bg-bg-grouped p-4">
      <h2 className="text-headline">{copy.adminFleet.assign.title}</h2>
      <AssignVehicleForm bookingId={booking.id} vehicles={vehiclesFor(booking, vehicles)} />
    </section>
  )
}
