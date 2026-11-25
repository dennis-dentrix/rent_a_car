import Link from 'next/link'
import Button from '@/components/Button'
import Panel from '@/components/Panel'
import { copy } from '@/copy/en'
import { momentText } from '@/lib/admin-format'
import { consoleGet } from '@/lib/console'

const text = copy.inspections.forBooking

/** A booking's reports, and the buttons to record the next one. */
export default async function BookingInspections({ bookingId, token }) {
  const { data, error } = await consoleGet(`/operator/bookings/${bookingId}/inspections`, token)
  const reports = data ?? []
  return (
    <Panel title={text.title} hint={text.hint}>
      {error && <p className="text-error">{copy.admin.loadError}</p>}
      {!error && reports.length === 0 && <p className="text-label-2">{text.none}</p>}
      <ul className="divide-y divide-separator empty:hidden">
        {reports.map((report) => (
          <li key={report.id} className="flex items-center justify-between gap-3 py-2">
            <span>
              {copy.inspections.reportTitle[report.type]} · {momentText(report.recorded_at)}
            </span>
            <Link
              href={`/console/inspections/${report.id}`}
              className="whitespace-nowrap font-semibold text-primary"
            >
              {text.open}
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap gap-3">
        {['pickup', 'return'].map((type) => (
          <Button
            key={type}
            href={`/console/bookings/${bookingId}/inspection?type=${type}`}
            variant={type === 'pickup' ? 'primary' : 'tonal'}
            size="compact"
          >
            {text.record[type]}
          </Button>
        ))}
      </div>
    </Panel>
  )
}
