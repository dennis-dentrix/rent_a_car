import Alert from '@/components/Alert'
import InspectionReport from '@/components/InspectionReport'
import { copy } from '@/copy/en'
import { orNotFound } from '@/lib/admin'
import { apiGet } from '@/lib/api'
import { requireRole } from '@/lib/auth/session'

const text = copy.inspections

export const metadata = { title: text.account.title, robots: { index: false, follow: false } }

export default async function AccountInspectionPage({ params }) {
  const { id } = await params
  const { token } = await requireRole(null, '/account')
  const { data, error } = orNotFound(await apiGet(`/renter/inspections/${id}`, { token }))
  if (error) return <Alert tone="error" title={copy.admin.loadError} />
  return (
    <div className="mx-auto w-full max-w-4xl">
      <InspectionReport
        report={data}
        side="account"
        backHref="/account"
        backLabel={text.backAccount}
      />
    </div>
  )
}
