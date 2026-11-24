import ConsoleShell from '@/components/ConsoleShell'
import { consoleRail, consoleTabs } from '@/lib/console'
import { requireOperator } from '@/lib/console'

// The rental company's area. Nothing here is for search engines, or for anyone who is not a company's person.
export const metadata = { robots: { index: false, follow: false } }

export default async function ConsoleLayout({ children }) {
  await requireOperator()
  return (
    <ConsoleShell items={consoleRail} tabs={consoleTabs}>
      <div className="mx-auto w-full max-w-5xl">{children}</div>
    </ConsoleShell>
  )
}
