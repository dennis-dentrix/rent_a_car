import MenuGroups from '@/components/MenuGroups'
import PageHeader from '@/components/PageHeader'
import SignOutForm from '@/components/SignOutForm'
import { copy } from '@/copy/en'
import { consoleRail } from '@/lib/console'

export const metadata = { title: copy.operatorConsole.nav.more }

// Phones show four tabs, so this page lists every section of the console.
export default function ConsoleMenuPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title={copy.operatorConsole.nav.more} />
      <MenuGroups items={consoleRail} />
      <SignOutForm />
    </div>
  )
}
