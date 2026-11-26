import { renterDocumentLinkAction, renterDocumentReviewAction } from '@/app/console/hire-actions'
import AdminDecision from '@/components/AdminDecision'
import DocumentViewer from '@/components/DocumentViewer'
import Panel from '@/components/Panel'
import StatusPill from '@/components/StatusPill'
import PanelList from '@/components/PanelList'
import { copy } from '@/copy/en'
import { consoleGet } from '@/lib/console'

const text = copy.hire.documents
const TONES = { uploaded: 'warning', verified: 'success', rejected: 'error' }
const REVIEW = [
  { value: 'verified', label: text.accept, variant: 'primary' },
  { value: 'rejected', label: text.reject, variant: 'destructive' },
]

function Document({ document, bookingId }) {
  const id = `${bookingId}:${document.id}`
  return (
    <li className="py-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-cell font-semibold">{copy.admin.documents.types[document.type]}</span>
        <StatusPill tone={TONES[document.status]}>
          {copy.admin.documents[document.status]}
        </StatusPill>
      </div>
      <DocumentViewer id={id} action={renterDocumentLinkAction} />
      {document.status === 'uploaded' && (
        <AdminDecision
          action={renterDocumentReviewAction}
          id={id}
          answerName="status"
          noteName="rejection_reason"
          noteLabel={text.rejectReason}
          answers={REVIEW}
        />
      )}
    </li>
  )
}

/** The renter's ID and licence, to open, accept, or reject. */
export default async function RenterDocuments({ bookingId, token }) {
  const { data, error } = await consoleGet(`/operator/bookings/${bookingId}/documents`, token)
  const documents = data ?? []
  return (
    <Panel title={text.title} hint={text.hint}>
      <PanelList error={error} isEmpty={documents.length === 0} empty={text.none}>
        {documents.map((document) => (
          <Document key={document.id} document={document} bookingId={bookingId} />
        ))}
      </PanelList>
    </Panel>
  )
}
