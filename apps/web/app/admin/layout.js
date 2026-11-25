import ConsoleShell from '@/components/ConsoleShell'
import StatusPill from '@/components/StatusPill'
import { copy } from '@/copy/en'
import { adminRail, adminTabs } from '@/lib/admin'
import { requireRole } from '@/lib/auth/session'

// Nothing in the admin area is for search engines, or for anyone who is not an admin who has used their second factor.
export const metadata = { robots: { index: false, follow: false } }

export default async function AdminLayout({ children }) {
  const { profile } = await requireRole(['admin'], '/admin')
  return (
    <ConsoleShell
      items={adminRail}
      tabs={adminTabs}
      area={copy.consoleUi.adminArea}
      identity={<StatusPill tone="info">{profile.full_name}</StatusPill>}
    >
      {children}
    </ConsoleShell>
  )
}
