import AdminPage from '@/components/AdminPage'
import { formatFullDate } from '@rent-a-car/shared'
import AdminCardList from '@/components/AdminCardList'
import AdminDecision from '@/components/AdminDecision'
import { reviewOperatorAction } from '@/app/admin/operators/actions'
import { copy } from '@/copy/en'
import { requireAdmin } from '@/lib/admin'
import { apiGet } from '@/lib/api'

const text = copy.auth.adminOperators

export const metadata = { title: text.meta.title }

// The companies waiting for an admin's review, oldest last so the newest application is seen first.
export default async function OperatorsReviewPage() {
  const { token } = await requireAdmin()
  const { data, error } = await apiGet('/admin/operators', { query: { status: 'pending' }, token })
  return (
    <AdminPage title={text.title} subtitle={text.subtitle} isNarrow>
      <AdminCardList items={data} error={error} emptyText={text.empty} Card={CompanyCard} />
    </AdminPage>
  )
}

function CompanyCard({ item: company }) {
  return (
    <li className="rounded-card bg-bg-grouped p-4">
      <h2 className="text-headline">{company.business_name}</h2>
      <p className="text-callout text-label-2">
        {[company.email, company.phone].filter(Boolean).join(' · ')}
      </p>
      <p className="text-footnote text-label-2">
        {text.appliedOn(formatFullDate(company.created_at))}
      </p>
      <AdminDecision
        action={reviewOperatorAction}
        id={company.id}
        answerName="to"
        noteName="reason"
        noteLabel={text.reasonLabel}
        answers={[
          { value: 'approved', label: text.approve, variant: 'primary' },
          { value: 'rejected', label: text.reject, variant: 'destructive' },
        ]}
      />
    </li>
  )
}
