import Alert from '@/components/Alert'
import BookingHead from '@/components/BookingHead'
import BookingFacts, { BookingTimeline } from '@/components/BookingFacts'
import BookingInspections from '@/components/BookingInspections'
import ConsoleJourney from '@/components/ConsoleJourney'
import { copy } from '@/copy/en'
import { loadBooking } from '@/lib/booking-load'
import { getOperatorClassNames, requireOperator } from '@/lib/console'

const text = copy.operatorConsole.bookings

export const metadata = { title: text.detail }

export default async function ConsoleBookingPage({ params }) {
  const { id } = await params
  const { token } = await requireOperator()
  const { booking, error, classNames } = await loadBooking(`/operator/bookings/${id}`, token, () =>
    getOperatorClassNames(token),
  )
  if (error) return <Alert tone="error" title={copy.admin.loadError} />
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <BookingHead booking={booking} backHref="/console/bookings" backLabel={text.back} />
      <BookingFacts booking={booking} className={classNames.get(booking.class_id)} />
      <ConsoleJourney bookingId={id} startAt={booking.start_at} token={token} />
      <BookingInspections bookingId={id} token={token} />
      <BookingTimeline events={booking.events} />
    </div>
  )
}
