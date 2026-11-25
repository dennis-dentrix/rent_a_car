import MenuGroups from '@/components/MenuGroups'
import PageHeader from '@/components/PageHeader'
import SignOutForm from '@/components/SignOutForm'
import { adminRail } from '@/lib/admin'
import { copy } from '@/copy/en'

export const metadata = { title: copy.admin.nav.more }

// Phones show four tabs, so this page lists every section of the admin.
export default function AdminMenuPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title={copy.admin.nav.more} />
      <MenuGroups items={adminRail} />
      <SignOutForm />
    </div>
  )
}
