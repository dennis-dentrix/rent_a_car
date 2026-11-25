import { formatShortDate } from '@carvo/shared'
import DataTable from '@/components/DataTable'
import Panel from '@/components/Panel'
import { copy } from '@/copy/en'
import { cancelledShare } from '@/lib/outcomes'

const text = copy.journey.outcomes

const COLUMNS = [
  { key: 'week', label: text.week, render: (row) => formatShortDate(row.week) },
  { key: 'confirmed', label: text.confirmed, isEnd: true },
  { key: 'cancelled', label: text.cancelled, isEnd: true },
  { key: 'no_shows', label: text.noShows, isEnd: true },
  { key: 'rate', label: `${text.rate} %`, isEnd: true, render: (row) => `${cancelledShare(row)}%` },
]

/** Week by week, how many confirmed bookings were cancelled or not turned up for: the before and the after. */
export default function BookingOutcomes({ weeks }) {
  return (
    <Panel title={text.title} hint={text.hint} isFlush>
      {weeks.length ? (
        <DataTable columns={COLUMNS} rows={weeks} getRowId={(row) => row.week} />
      ) : (
        <p className="px-5 pb-8 pt-4 text-center text-cell text-label-2">{text.empty}</p>
      )}
    </Panel>
  )
}
