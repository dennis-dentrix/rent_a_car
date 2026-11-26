import { answerRequestAction } from '@/app/console/hire-actions'
import AdminDecision from '@/components/AdminDecision'
import Panel from '@/components/Panel'
import { copy } from '@/copy/en'
import { momentText } from '@/lib/admin-format'

const text = copy.hire.request
const ANSWERS = [
  { value: 'accept', label: text.accept, variant: 'primary' },
  { value: 'decline', label: text.decline, variant: 'destructive' },
]

/** A renter's request, to accept or decline before it expires. */
export default function RequestAnswer({ booking }) {
  return (
    <Panel title={text.title} hint={text.hint(momentText(booking.hold_expires_at))}>
      <AdminDecision
        action={answerRequestAction}
        id={booking.id}
        answerName="answer"
        noteName="reason"
        noteLabel={text.reason}
        answers={ANSWERS}
      />
    </Panel>
  )
}
