import { bookingStatusAction } from '@/app/admin/actions'
import AdminDecision from '@/components/AdminDecision'
import AssignVehicleForm from '@/components/AssignVehicleForm'
import Alert from '@/components/Alert'
import BookingHead from '@/components/BookingHead'
import BookingFacts, { BookingTimeline } from '@/components/BookingFacts'
import { copy } from '@/copy/en'
import { adminGet, getClassNames, requireAdmin } from '@/lib/admin'
import { loadBooking } from '@/lib/booking-load'

const text = copy.admin.bookings

export const metadata = { title: text.title }

// A car can be put on a booking that has not started and has none yet.
const canAssign = (booking) =>
  !booking.vehicle && ['pending_payment', 'confirmed', 'ready'].includes(booking.status)

const vehiclesFor = (booking, vehicles = []) =>
  vehicles
    .filter((v) => v.class_id === booking.class_id && v.status === 'active')
    .map((v) => ({
      id: v.id,
      label: `${[v.make, v.model].filter(Boolean).join(' ')} ${v.registration}`.trim(),
    }))

const moves = (booking) =>
  booking.next_statuses.map((value) => ({
    value,
    label: copy.status[value],
    variant: value === 'cancelled' || value === 'expired' ? 'destructive' : 'primary',
  }))

export default async function AdminBookingPage({ params }) {
  const { id } = await params
  const { token } = await requireAdmin()
  const [{ booking, error, classNames }, vehicles] = await Promise.all([
    loadBooking(`/staff/bookings/${id}`, token, getClassNames),
    adminGet('/staff/vehicles', token, { limit: 100 }),
  ])
  if (error) return <Alert tone="error" title={copy.admin.loadError} />
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <BookingHead booking={booking} backHref="/admin/bookings" backLabel={text.title} />
      <BookingFacts booking={booking} className={classNames.get(booking.class_id)} />
      <MoveSection booking={booking} />
      <AssignSection booking={booking} vehicles={vehicles.data} />
      <BookingTimeline events={booking.events} />
    </div>
  )
}
