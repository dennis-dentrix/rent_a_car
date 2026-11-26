import BackLink from '@/components/BackLink'
import PageHeader from '@/components/PageHeader'
import StatusBadge from '@/components/StatusBadge'
import { personName } from '@/lib/admin-format'

/** The top of a booking page: a link back to the list, the customer, the reference, and the status. */
export default function BookingHead({ booking, backHref, backLabel }) {
  return (
    <>
      <BackLink href={backHref}>← {backLabel}</BackLink>
      <PageHeader
        eyebrow={booking.reference}
        title={personName(booking.customer)}
        actions={<StatusBadge status={booking.status} />}
      />
    </>
  )
}
