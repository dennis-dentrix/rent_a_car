import BackLink from '@/components/BackLink'
import AdminPage from '@/components/AdminPage'
import ReportBody from '@/components/ReportBody'
import ReportSignatures from '@/components/ReportSignatures'
import { copy } from '@/copy/en'

const text = copy.inspections

/** A whole report page, the same for the company and the renter apart from who may sign. */
export default function InspectionReport({ report, side, backHref, backLabel }) {
  return (
    <AdminPage eyebrow={report.reference} title={text.reportTitle[report.type]}>
      <BackLink href={backHref}>← {backLabel}</BackLink>
      <ReportBody report={report} />
      <ReportSignatures report={report} side={side} />
    </AdminPage>
  )
}
