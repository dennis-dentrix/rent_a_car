import Link from 'next/link'
import { formatFullDate } from '@rent-a-car/shared'
import Alert from '@/components/Alert'
import LargeTitle from '@/components/LargeTitle'
import OperatorReview from '@/components/OperatorReview'
import { copy } from '@/copy/en'
import { apiGet } from '@/lib/api'
import { getCurrentUser } from '@/lib/auth/session'

const text = copy.auth.adminOperators

export const metadata = { title: text.meta.title }

// The companies waiting for an admin's review, oldest last so the newest application is seen first.
export default async function OperatorsReviewPage() {
  const { token } = await getCurrentUser()
  const { data, error } = await apiGet('/admin/operators', { query: { status: 'pending' }, token })
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <Link
        href="/admin"
        className="text-callout font-medium text-primary underline underline-offset-2"
      >
        {text.back}
      </Link>
      <LargeTitle subtitle={text.subtitle}>{text.title}</LargeTitle>
      {error && <Alert tone="error" title={copy.classPage.errorTitle} />}
      {data?.length === 0 && <p className="text-body text-label-2">{text.empty}</p>}
      <ul className="flex flex-col gap-4">
        {(data ?? []).map((company) => (
          <li key={company.id} className="rounded-card bg-bg-grouped p-4">
            <h2 className="text-headline">{company.business_name}</h2>
            <p className="text-callout text-label-2">
              {[company.email, company.phone].filter(Boolean).join(' · ')}
            </p>
            <p className="text-footnote text-label-2">
              {text.appliedOn(formatFullDate(company.created_at))}
            </p>
            <OperatorReview id={company.id} />
          </li>
        ))}
      </ul>
    </div>
  )
}
