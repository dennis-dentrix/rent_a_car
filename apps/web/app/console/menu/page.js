import InsetList from '@/components/InsetList'
import LargeTitle from '@/components/LargeTitle'
import SignOutForm from '@/components/SignOutForm'
import { copy } from '@/copy/en'
import { consoleRail } from '@/lib/console'

export const metadata = { title: copy.operatorConsole.nav.more }

// Phones show four tabs, so this page lists every section of the console.
export default function ConsoleMenuPage() {
  const items = consoleRail.map((item) => ({ id: item.href, href: item.href, title: item.label }))
  return (
    <div className="flex flex-col gap-5">
      <LargeTitle>{copy.operatorConsole.nav.more}</LargeTitle>
      <InsetList items={items} />
      <SignOutForm />
    </div>
  )
}
