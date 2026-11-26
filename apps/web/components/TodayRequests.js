import Link from 'next/link'
import { formatMoney, nairobiDate } from '@carvo/shared'
import { answerRequestAction } from '@/app/console/hire-actions'
import AdminDecision from '@/components/AdminDecision'
import Panel from '@/components/Panel'
import { copy } from '@/copy/en'
import { momentText } from '@/lib/admin-format'
import { formatStayRange } from '@/lib/stay-range'

const text = copy.today
const ANSWERS = [
  { value: 'accept', label: copy.hire.request.accept, variant: 'primary' },
  { value: 'decline', label: copy.hire.request.decline, variant: 'destructive' },
]

const summary = (request) =>
  [
    request.renter,
    formatStayRange({
      start: nairobiDate(request.start_at),
      end: nairobiDate(request.end_at),
    }),
    request.pickup_place && request.destination
      ? `${request.pickup_place} → ${request.destination}`
      : request.destination,
  ]
    .filter(Boolean)
    .join(' · ')

function Request({ request }) {
  return (
    <li className="py-4">
      <Link href={`/console/bookings/${request.id}`} className="block">
        <span className="block text-headline">
          {request.car?.make} {request.car?.model} · {formatMoney(request.total_kes)}
        </span>
        <span className="block text-cell text-label-2">{summary(request)}</span>
        <span className="block text-cell font-semibold text-warning">
          {text.answerBy(momentText(request.answer_by))}
        </span>
      </Link>
      <AdminDecision
        action={answerRequestAction}
        id={request.id}
        answerName="answer"
        noteName="reason"
        noteLabel={copy.hire.request.reason}
        answers={ANSWERS}
      />
    </li>
  )
}

/** Renters waiting for an answer. Nothing is shown when nobody is. */
export default function TodayRequests({ requests }) {
  if (!requests.length) return null
  return (
    <Panel title={text.requests}>
      <ul className="divide-y divide-separator">
        {requests.map((request) => (
          <Request key={request.id} request={request} />
        ))}
      </ul>
    </Panel>
  )
}
