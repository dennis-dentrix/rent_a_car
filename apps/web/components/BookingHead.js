import Link from 'next/link'
import LargeTitle from '@/components/LargeTitle'
import StatusBadge from '@/components/StatusBadge'
import { personName } from '@/lib/admin-format'

/** The top of a booking page: a link back to the list, the customer, the reference, and the status. */
export default function BookingHead({ booking, backHref, backLabel }) {
  return (
    <>
      <Link
        href={backHref}
        className="text-callout font-medium text-primary underline underline-offset-2"
      >
        {backLabel}
      </Link>
      <LargeTitle subtitle={booking.reference}>{personName(booking.customer)}</LargeTitle>
      <StatusBadge status={booking.status} />
    </>
  )
}
