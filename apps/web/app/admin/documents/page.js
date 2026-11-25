import AdminPage from '@/components/AdminPage'
import Link from 'next/link'
import { documentReviewAction } from '@/app/admin/actions'
import AdminDecision from '@/components/AdminDecision'
import AdminFilters from '@/components/AdminFilters'
import AdminMoreLink from '@/components/AdminMoreLink'
import AdminCardList from '@/components/AdminCardList'
import Badge from '@/components/Badge'
import DocumentViewer from '@/components/DocumentViewer'
import { copy } from '@/copy/en'
import { adminGet, requireAdmin } from '@/lib/admin'
import { momentText, nextPageHref, personName } from '@/lib/admin-format'

const text = copy.admin.documents

export const metadata = { title: text.title }

const STATUSES = ['uploaded', 'verified', 'rejected']
const OPTIONS = STATUSES.map((value) => ({ value, label: text[value] }))

function Review({ document }) {
  return (
    <AdminDecision
      action={documentReviewAction}
      id={document.id}
      answerName="status"
      noteName="rejection_reason"
      noteLabel={text.reasonLabel}
      answers={[
        { value: 'verified', label: text.verify, variant: 'primary' },
        { value: 'rejected', label: text.reject, variant: 'destructive' },
      ]}
    />
  )
}

function DocumentCard({ item: document }) {
  return (
    <li className="rounded-panel border border-separator bg-surface p-5 shadow-1">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-section">{text.types[document.type]}</h2>
          <p className="text-cell text-label-2">
            {personName(document.owner)} · {momentText(document.created_at)}
          </p>
          {document.rejection_reason && (
            <p className="text-meta text-label-2">{document.rejection_reason}</p>
          )}
        </div>
        {document.booking_id && (
          <Link
            href={`/admin/bookings/${document.booking_id}`}
            className="text-cell font-medium text-primary underline underline-offset-2"
          >
            {copy.admin.nav.bookings}
          </Link>
        )}
      </div>
      <DocumentViewer id={document.id} />
      {document.status === 'uploaded' ? (
        <Review document={document} />
      ) : (
        <Badge>{text[document.status]}</Badge>
      )}
    </li>
  )
}

export default async function AdminDocumentsPage({ searchParams }) {
  const { status, cursor } = await searchParams
  const { token } = await requireAdmin()
  const filter = STATUSES.includes(status) ? status : 'uploaded'
  const { data, meta, error } = await adminGet('/staff/documents', token, {
    status: filter,
    cursor,
  })
  const older = nextPageHref('/admin/documents', { status: filter }, meta?.next_cursor)
  return (
    <AdminPage title={text.title} subtitle={text.subtitle} isNarrow>
      <AdminFilters base="/admin/documents" name="status" current={filter} options={OPTIONS} />
      <AdminCardList items={data} error={error} emptyText={text.empty} Card={DocumentCard} />
      <AdminMoreLink href={older}>{copy.admin.bookings.more}</AdminMoreLink>
    </AdminPage>
  )
}
