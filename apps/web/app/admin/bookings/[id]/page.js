import Link from 'next/link'
import { notFound } from 'next/navigation'
import { formatMoney } from '@rent-a-car/shared'
import { bookingStatusAction } from '@/app/admin/actions'
import AdminDecision from '@/components/AdminDecision'
import Alert from '@/components/Alert'
import InsetList from '@/components/InsetList'
import LargeTitle from '@/components/LargeTitle'
import StatusBadge from '@/components/StatusBadge'
import { copy } from '@/copy/en'
import { adminGet, getClassNames, requireAdmin } from '@/lib/admin'
import { momentText, personName } from '@/lib/admin-format'

const text = copy.admin.bookings

export const metadata = { title: text.title }

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

const moves = (booking) =>
  booking.next_statuses.map((value) => ({
    value,
    label: copy.status[value],
    variant: value === 'cancelled' || value === 'expired' ? 'destructive' : 'primary',
  }))

export default async function AdminBookingPage({ params }) {
  const { id } = await params
  const { token } = await requireAdmin()
  const [result, classNames] = await Promise.all([
    adminGet(`/staff/bookings/${id}`, token),
    getClassNames(),
  ])
  if (result.error === 'NOT_FOUND' || result.error === 'VALIDATION_FAILED') notFound()
  if (result.error) return <Alert tone="error" title={copy.admin.loadError} />
  const booking = result.data
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <Link
        href="/admin/bookings"
        className="text-callout font-medium text-primary underline underline-offset-2"
      >
        {text.title}
      </Link>
      <LargeTitle subtitle={booking.reference}>{personName(booking.customer)}</LargeTitle>
      <StatusBadge status={booking.status} />
      <InsetList items={facts(booking, classNames.get(booking.class_id))} />
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
      <Timeline events={booking.events} />
    </div>
  )
}

function Timeline({ events }) {
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
