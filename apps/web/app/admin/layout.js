import ConsoleShell from '@/components/ConsoleShell'
import { adminRail, adminTabs } from '@/lib/admin'
import { requireRole } from '@/lib/auth/session'

// Nothing in the admin area is for search engines, or for anyone who is not an admin who has used their second factor.
export const metadata = { robots: { index: false, follow: false } }

export default async function AdminLayout({ children }) {
  await requireRole(['admin'], '/admin')
  return (
    <ConsoleShell items={adminRail} tabs={adminTabs}>
      <div className="mx-auto w-full max-w-5xl">{children}</div>
    </ConsoleShell>
  )
}
