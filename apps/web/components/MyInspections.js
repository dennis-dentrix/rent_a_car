import InsetList from '@/components/InsetList'
import StatusPill from '@/components/StatusPill'
import { copy } from '@/copy/en'
import { momentText } from '@/lib/admin-format'
import { reportStatus } from '@/lib/inspections'

const text = copy.inspections

function toItem(report) {
  const { key, tone } = reportStatus(report)
  return {
    id: report.id,
    href: `/account/inspections/${report.id}`,
    title: `${text.reportTitle[report.type]} · ${report.reference}`,
    detail: momentText(report.recorded_at),
    trailing: <StatusPill tone={tone}>{text.account.status[key]}</StatusPill>,
  }
}

/** The renter's own reports, on their account page. */
export default function MyInspections({ reports }) {
  return (
    <section aria-labelledby="my-inspections" className="flex flex-col gap-3">
      <h2 id="my-inspections" className="text-headline">
        {text.account.title}
      </h2>
      {reports.length ? (
        <InsetList items={reports.map(toItem)} />
      ) : (
        <p className="text-label-2">{text.account.none}</p>
      )}
    </section>
  )
}
