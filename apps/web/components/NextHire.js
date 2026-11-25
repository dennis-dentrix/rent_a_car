import Link from 'next/link'
import { ArrowRight, CalendarClock, Search } from 'lucide-react'
import Button from '@/components/Button'
import { copy } from '@/copy/en'
import { momentText } from '@/lib/admin-format'

const text = copy.renterHome

const PANEL = 'flex flex-col gap-3 rounded-panel bg-hero p-5 text-on-hero'

function Nothing() {
  return (
    <section className={PANEL}>
      <h2 className="text-title-2">{text.noHireTitle}</h2>
      <p className="text-body text-on-hero-2">{text.noHireText}</p>
      <Button href="/cars" variant="light" className="self-start">
        <Search size={18} aria-hidden="true" />
        {text.findCar}
      </Button>
    </section>
  )
}

/** The one thing a renter came to see: their next hire, or the way to start one. */
export default function NextHire({ booking, carType }) {
  if (!booking) return <Nothing />
  return (
    <Link
      href={`/account/bookings/${booking.id}`}
      className={`${PANEL} group transition-transform duration-fast active:scale-[0.99]`}
    >
      <span className="flex items-center gap-2 text-footnote text-on-hero-2">
        <CalendarClock size={16} aria-hidden="true" />
        {text.nextHire} · {copy.status[booking.status]}
      </span>
      <span className="text-title-1">{carType ?? booking.reference}</span>
      <span className="num text-body text-on-hero-2">
        {momentText(booking.start_at)} · {booking.reference}
      </span>
      <span className="inline-flex items-center gap-1 text-callout font-semibold">
        {text.open}
        <ArrowRight
          size={16}
          aria-hidden="true"
          className="transition-transform duration-standard group-hover:translate-x-0.5"
        />
      </span>
    </Link>
  )
}
