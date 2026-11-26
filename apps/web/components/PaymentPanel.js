import { formatMoney } from '@carvo/shared'
import Panel from '@/components/Panel'
import PaymentForm from '@/components/PaymentForm'
import { copy } from '@/copy/en'
import { paymentTotals } from '@/lib/hire'

const text = copy.hire.payment

/** What has been received against the total, and a form while anything is still owed. */
export default function PaymentPanel({ booking }) {
  const { paid, owed } = paymentTotals(booking)
  const isOpen = owed > 0 && !['cancelled', 'expired'].includes(booking.status)
  return (
    <Panel title={text.title} hint={text.paid(formatMoney(paid), formatMoney(booking.total_kes))}>
      {isOpen && <PaymentForm key={paid} bookingId={booking.id} owed={owed} />}
    </Panel>
  )
}
