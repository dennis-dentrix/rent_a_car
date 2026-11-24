import InsetList from '@/components/InsetList'
import LargeTitle from '@/components/LargeTitle'
import { adminRail } from '@/lib/admin'
import { copy } from '@/copy/en'

export const metadata = { title: copy.admin.nav.more }

// Phones show four tabs, so this page lists every section of the admin.
export default function AdminMenuPage() {
  const items = adminRail.map((item) => ({ id: item.href, href: item.href, title: item.label }))
  return (
    <div className="flex flex-col gap-5">
      <LargeTitle>{copy.admin.nav.more}</LargeTitle>
      <InsetList items={items} />
    </div>
  )
}
