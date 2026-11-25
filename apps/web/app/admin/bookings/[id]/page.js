import { bookingStatusAction } from '@/app/admin/actions'
import AdminDecision from '@/components/AdminDecision'
import AssignVehicleForm from '@/components/AssignVehicleForm'
import Alert from '@/components/Alert'
import BookingHead from '@/components/BookingHead'
import BookingFacts, { BookingTimeline } from '@/components/BookingFacts'
import { copy } from '@/copy/en'
import { adminGet, getClassNames, requireAdmin } from '@/lib/admin'
import { driverOptions, needsAssignment, vehicleOptions } from '@/lib/assignment'
import { loadBooking } from '@/lib/booking-load'

const text = copy.admin.bookings

export const metadata = { title: text.title }

const moves = (booking) =>
  booking.next_statuses.map((value) => ({
    value,
    label: copy.status[value],
    variant: value === 'cancelled' || value === 'expired' ? 'destructive' : 'primary',
  }))

function MoveSection({ booking }) {
  return (
    <section className="rounded-panel border border-separator bg-surface p-5 shadow-1">
      <h2 className="text-section">{text.moveTo}</h2>
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
        <p className="mt-2 text-cell text-label-2">{text.noMoves}</p>
      )}
    </section>
  )
}

function AssignSection({ booking, vehicles, drivers }) {
  if (!needsAssignment(booking)) return null
  const isDelivery = booking.handover.type === 'delivery'
  return (
    <section className="rounded-panel border border-separator bg-surface p-5 shadow-1">
      <h2 className="text-section">{copy.adminFleet.assign.title(isDelivery)}</h2>
      <AssignVehicleForm
        bookingId={booking.id}
        vehicles={vehicleOptions(booking, vehicles)}
        drivers={isDelivery ? driverOptions(drivers) : null}
        current={{ vehicleId: booking.vehicle?.id, driverId: booking.driver?.id }}
      />
    </section>
  )
}

export default async function AdminBookingPage({ params }) {
  const { id } = await params
  const { token } = await requireAdmin()
  const [{ booking, error, classNames }, vehicles, drivers] = await Promise.all([
    loadBooking(`/staff/bookings/${id}`, token, getClassNames),
    adminGet('/staff/vehicles', token, { limit: 100 }),
    adminGet('/admin/drivers', token, { limit: 100 }),
  ])
  if (error) return <Alert tone="error" title={copy.admin.loadError} />
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <BookingHead booking={booking} backHref="/admin/bookings" backLabel={text.title} />
      <BookingFacts booking={booking} className={classNames.get(booking.class_id)} />
      <MoveSection booking={booking} />
      <AssignSection booking={booking} vehicles={vehicles.data} drivers={drivers.data} />
      <BookingTimeline events={booking.events} />
    </div>
  )
}
