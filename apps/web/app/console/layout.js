import ConsoleShell from '@/components/ConsoleShell'
import StatusPill from '@/components/StatusPill'
import { copy } from '@/copy/en'
import { consoleRail, consoleTabs, requireOperator } from '@/lib/console'

const TONES = { approved: 'success', pending: 'warning', rejected: 'error', suspended: 'error' }

// The rental company's area. Nothing here is for search engines, or for anyone who is not a company's person.
export const metadata = { robots: { index: false, follow: false } }

export default async function ConsoleLayout({ children }) {
  const { profile } = await requireOperator()
  const { business_name: name, status } = profile.operator
  const identity = (
    <StatusPill tone={TONES[status]}>
      {name} · {copy.consoleUi.companyStatus[status]}
    </StatusPill>
  )
  return (
    <ConsoleShell
      items={consoleRail}
      tabs={consoleTabs}
      area={copy.consoleUi.operatorArea}
      identity={identity}
    >
      {children}
    </ConsoleShell>
  )
}
