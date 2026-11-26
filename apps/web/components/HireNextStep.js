import { hireStatusAction } from '@/app/console/hire-actions'
import AdminDecision from '@/components/AdminDecision'
import Panel from '@/components/Panel'
import { copy } from '@/copy/en'
import { canCancel, nextStep } from '@/lib/hire'

const text = copy.hire.next

function Cancel({ bookingId }) {
  return (
    <details className="mt-4 border-t border-separator pt-3">
      <summary className="min-h-touch cursor-pointer text-cell font-semibold text-label-2">
        {text.cancelTitle}
      </summary>
      <AdminDecision
        action={hireStatusAction}
        id={bookingId}
        answerName="to_status"
        noteName="note"
        noteLabel={text.cancelReason}
        answers={[{ value: 'cancelled', label: text.cancel, variant: 'destructive' }]}
      />
    </details>
  )
}

/** The one thing to do next with a booking, and cancelling tucked beneath it. */
export default function HireNextStep({ booking }) {
  const next = nextStep(booking.status)
  return (
    <Panel title={text.title} hint={next ? text.needs[next] : text.done}>
      {next && (
        <AdminDecision
          key={next}
          action={hireStatusAction}
          id={booking.id}
          answerName="to_status"
          answers={[{ value: next, label: text.steps[next], variant: 'primary' }]}
        />
      )}
      {canCancel(booking.status) && <Cancel bookingId={booking.id} />}
    </Panel>
  )
}
