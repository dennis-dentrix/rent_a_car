import Alert from '@/components/Alert'
import { copy } from '@/copy/en'

const text = copy.auth.console
const TONES = { pending: 'info', rejected: 'error', suspended: 'warning' }

/** Where the company stands in Carvo's review. Nothing is shown once it is approved, so the page stays quiet. */
export default function ConsoleStatus({ company }) {
  if (company.status === 'approved') return null
  const status = text.status[company.status]
  return (
    <Alert tone={TONES[company.status]} title={status.title}>
      {company.status_reason
        ? `${status.text} ${text.reason}: ${company.status_reason}`
        : status.text}
    </Alert>
  )
}
