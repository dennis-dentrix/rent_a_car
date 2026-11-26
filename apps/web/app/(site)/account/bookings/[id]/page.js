import BackLink from '@/components/BackLink'
import { notFound } from 'next/navigation'
import { formatMoney } from '@carvo/shared'
import Alert from '@/components/Alert'
import BookingJourney from '@/components/BookingJourney'
import InsetList from '@/components/InsetList'
import LargeTitle from '@/components/LargeTitle'
import LivePoll from '@/components/LivePoll'
import MarkBookingSeen from '@/components/MarkBookingSeen'
import MyInspections from '@/components/MyInspections'
import TripCar from '@/components/TripCar'
import TripTasks from '@/components/TripTasks'
import { copy } from '@/copy/en'
import { momentText } from '@/lib/admin-format'
import { apiGet } from '@/lib/api'
import { requireRole } from '@/lib/auth/session'
import { isBeforePickup, tripTasks } from '@/lib/trip'
import { tripFacts } from '@/lib/trip-facts'

const text = copy.journey.renter

export const metadata = { title: text.listTitle, robots: { index: false, follow: false } }

const facts = (booking) => [
  {
    id: 'dates',
    title: text.dates,
    detail: `${momentText(booking.start_at)} → ${momentText(booking.end_at)}`,
  },
  {
    id: 'handover',
    title: text.handover,
    detail: copy.admin.bookings.handover[booking.handover_type],
  },
  { id: 'total', title: text.total, detail: formatMoney(booking.total_kes) },
  ...tripFacts(booking),
]

// Everything about the trip that the renter needs, and the agreement and reports that belong to it.
async function loadTrip(id, token) {
  const path = `/bookings/${encodeURIComponent(id)}`
  const [trip, agreement, reports] = await Promise.all([
    apiGet(path, { token }),
    apiGet(`${path}/agreement`, { token }),
    apiGet('/renter/inspections', { token }),
  ])
  const own = (reports.data ?? []).filter((report) => report.reference === trip.data?.reference)
  return { ...trip, agreement: agreement.data, reports: own }
}

export default async function MyBookingPage({ params }) {
  const { id } = await params
  const { token } = await requireRole(null, `/account/bookings/${id}`)
  const { data: booking, error, agreement, reports } = await loadTrip(id, token)
  if (error === 'NOT_FOUND') notFound()
  if (error) return <Alert tone="error" title={copy.admin.loadError} />
  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <BackLink href="/account/bookings">← {text.back}</BackLink>
      <MarkBookingSeen id={id} status={booking.status} />
      <LargeTitle subtitle={copy.journey.live}>{booking.reference}</LargeTitle>
      <TripCar car={booking.car} company={booking.company} />
      {booking.status === 'requested' && (
        <Alert tone="info" title={copy.trip.waiting(momentText(booking.hold_expires_at))} />
      )}
      {isBeforePickup(booking.status) && (
        <TripTasks tasks={tripTasks(booking, agreement)} bookingId={booking.id} />
      )}
      <section aria-label={copy.journey.title}>
        <BookingJourney journey={booking.journey} forRenter />
      </section>
      <InsetList items={facts(booking)} />
      {reports.length > 0 && <MyInspections reports={reports} />}
      <LivePoll />
    </div>
  )
}
