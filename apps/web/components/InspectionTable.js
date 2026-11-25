import DataTable from '@/components/DataTable'
import StatusPill from '@/components/StatusPill'
import { copy } from '@/copy/en'
import { momentText } from '@/lib/admin-format'
import { carName } from '@/lib/car-facts'
import { reportStatus } from '@/lib/inspections'

const text = copy.inspections

const booking = (report) => (
  <span className="flex flex-col">
    <span className="num font-bold">{report.reference}</span>
    {report.renter && <span className="text-meta text-label-2">{report.renter}</span>}
  </span>
)

const car = ({ vehicle }) =>
  vehicle ? `${carName(vehicle, '')} ${vehicle.registration}`.trim() : null

const status = (report) => {
  const { tone, label } = reportStatus(report)
  return <StatusPill tone={tone}>{label}</StatusPill>
}

const COLUMNS = [
  { key: 'booking', label: text.columns.booking, render: booking },
  { key: 'car', label: text.columns.car, render: car },
  { key: 'type', label: text.columns.type, render: (report) => text.types[report.type] },
  { key: 'recorded', label: text.columns.recorded, render: (r) => momentText(r.recorded_at) },
  { key: 'status', label: text.columns.status, render: status },
]

/** The company's reports as a table, each row opening its report under `basePath`. */
export default function InspectionTable({ reports, basePath }) {
  return (
    <DataTable
      columns={COLUMNS}
      rows={reports}
      getRowId={(report) => report.id}
      getRowHref={(report) => `${basePath}/${report.id}`}
    />
  )
}
