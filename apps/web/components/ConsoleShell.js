import SidebarRail from '@/components/SidebarRail'
import TabBar from '@/components/TabBar'
import { copy } from '@/copy/en'

/**
 * Operator console and admin: a side rail from tablet up, a four-item tab bar on phones. `tabs` is the phone list
 * when it differs from the rail's (the admin has more sections than fit in a tab bar).
 */
export default function ConsoleShell({ items, tabs = items, children }) {
  return (
    <div className="flex min-h-dvh pb-[calc(theme(spacing.tabbar)+env(safe-area-inset-bottom))] md:pb-0">
      <SidebarRail items={items} label={copy.nav.main} />
      <main className="min-w-0 flex-1 px-4 py-6 md:px-6 lg:px-10">{children}</main>
      <TabBar items={tabs} label={copy.nav.main} />
    </div>
  )
}
