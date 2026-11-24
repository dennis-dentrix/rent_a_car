import Alert from '@/components/Alert'
import Eyebrow from '@/components/Eyebrow'
import LargeTitle from '@/components/LargeTitle'
import SignOutForm from '@/components/SignOutForm'
import { copy } from '@/copy/en'
import { getCurrentUser } from '@/lib/auth/session'

const text = copy.auth.console
const TONES = { pending: 'info', approved: 'success', rejected: 'error', suspended: 'warning' }

export const metadata = { title: text.meta.title }

// Where a company stands in the review. The tools for the fleet join this page as they are built.
export default async function ConsolePage() {
  const { profile } = await getCurrentUser()
  const { operator } = profile
  const status = text.status[operator.status]
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Eyebrow>{text.eyebrow}</Eyebrow>
        <LargeTitle>{operator.business_name}</LargeTitle>
      </div>
      <Alert tone={TONES[operator.status]} title={status.title}>
        {operator.status_reason
          ? `${status.text} ${text.reason}: ${operator.status_reason}`
          : status.text}
      </Alert>
      <SignOutForm />
    </div>
  )
}
