import ConsoleShell from '@/components/ConsoleShell'
import LargeTitle from '@/components/LargeTitle'
import { consoleTabs } from '@/lib/nav'

// Shows the operator console shell: side rail from tablet up, tab bar on phones.
export default function ConsoleShellPage() {
  return (
    <ConsoleShell items={consoleTabs}>
      <LargeTitle>Console shell</LargeTitle>
    </ConsoleShell>
  )
}
