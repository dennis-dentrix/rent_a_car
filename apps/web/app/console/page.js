import AdminPage from '@/components/AdminPage'
import Alert from '@/components/Alert'
import Button from '@/components/Button'
import ConsoleStatus from '@/components/ConsoleStatus'
import DeviceAlertsButton from '@/components/DeviceAlertsButton'
import LivePoll from '@/components/LivePoll'
import SetupChecklist from '@/components/SetupChecklist'
import TodayFigures from '@/components/TodayFigures'
import TodayHandovers from '@/components/TodayHandovers'
import TodayMessages from '@/components/TodayMessages'
import TodayRequests from '@/components/TodayRequests'
import { copy } from '@/copy/en'
import { consoleGet, requireOperator } from '@/lib/console'

const text = copy.today

export const metadata = { title: copy.operatorConsole.meta.title }

// The company's first page: who is waiting for an answer, then the cars changing hands today.
export default async function ConsolePage() {
  const { token } = await requireOperator()
  const [{ data, error }, conversations] = await Promise.all([
    consoleGet('/operator/overview', token),
    consoleGet('/messages', token),
  ])
  if (error) return <Alert tone="error" title={copy.admin.loadError} />
  const waiting = data.requests.length
  return (
    <AdminPage
      eyebrow={data.company.business_name}
      title={text.title}
      subtitle={waiting ? text.waiting(waiting) : text.quiet}
      actions={
        <Button href="/console/fleet" variant="tonal">
          {text.addCar}
        </Button>
      }
    >
      <ConsoleStatus company={data.company} />
      {/* Someone waiting comes first: requests, then messages, then the day's cars. */}
      <TodayRequests requests={data.requests} />
      <TodayMessages conversations={conversations.data ?? []} />
      <TodayHandovers handovers={data.handovers} />
      <TodayFigures overview={data} />
      <SetupChecklist overview={data} />
      <DeviceAlertsButton />
      <LivePoll />
    </AdminPage>
  )
}
