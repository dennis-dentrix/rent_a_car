import Link from 'next/link'
import { notFound } from 'next/navigation'
import { formatMoney } from '@carvo/shared'
import Alert from '@/components/Alert'
import BookingJourney from '@/components/BookingJourney'
import InsetList from '@/components/InsetList'
import LargeTitle from '@/components/LargeTitle'
import LivePoll from '@/components/LivePoll'
import { copy } from '@/copy/en'
import { momentText } from '@/lib/admin-format'
import { apiGet } from '@/lib/api'
import { requireRole } from '@/lib/auth/session'

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
]

export default async function MyBookingPage({ params }) {
  const { id } = await params
  const { token } = await requireRole(null, `/account/bookings/${id}`)
  const { data: booking, error } = await apiGet(`/bookings/${encodeURIComponent(id)}`, { token })
  if (error === 'NOT_FOUND') notFound()
  if (error) return <Alert tone="error" title={copy.admin.loadError} />
  return (
    <div className="mx-auto flex max-w-md flex-col gap-5">
      <Link href="/account/bookings" className="w-max text-callout font-semibold text-primary">
        ← {text.back}
      </Link>
      <LargeTitle subtitle={copy.journey.live}>{booking.reference}</LargeTitle>
      <section aria-label={copy.journey.title}>
        <BookingJourney journey={booking.journey} forRenter />
      </section>
      <InsetList items={facts(booking)} />
      <p className="text-footnote text-label-2">{text.reports}</p>
      <LivePoll />
    </div>
  )
}
