import { copy } from '@/copy/en'
import { cx } from '@/lib/cx'

const text = copy.calendar
const LOOK = {
  booked: 'bg-primary text-on-primary',
  blocked: 'bg-warning-bg text-warning',
  free: 'bg-fill text-label-3',
}
// A letter as well as a colour, so a state never rests on colour alone.
const MARK = { booked: 'B', blocked: '×', free: '' }

function Row({ row }) {
  return (
    <tr>
      <th scope="row" className="sticky left-0 bg-surface py-1 pr-3 text-left text-cell">
        <span className="block whitespace-nowrap font-semibold">
          {[row.make, row.model].filter(Boolean).join(' ') || row.registration}
        </span>
        <span className="block text-footnote font-normal text-label-2">{row.registration}</span>
      </th>
      {row.cells.map((cell) => (
        <td key={cell.day} className="p-0.5">
          <span
            title={`${cell.day}: ${text.states[cell.state]}`}
            className={cx(
              'flex h-9 w-9 items-center justify-center rounded-control text-footnote font-bold',
              LOOK[cell.state],
            )}
          >
            <span aria-hidden="true">{MARK[cell.state]}</span>
            <span className="sr-only">{text.states[cell.state]}</span>
          </span>
        </td>
      ))}
    </tr>
  )
}

/** Cars down the side, days across. It scrolls sideways on a phone with the car's name kept in view. */
export default function CalendarGrid({ days, rows }) {
  return (
    <div className="relative overflow-x-auto rounded-panel border border-separator bg-surface p-4">
      <table className="border-collapse">
        <thead>
          <tr>
            <th scope="col" className="sticky left-0 bg-surface">
              <span className="sr-only">{text.car}</span>
            </th>
            {days.map((day) => (
              <th key={day} scope="col" className="num pb-2 text-footnote text-label-2">
                {Number(day.slice(8))}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <Row key={row.id} row={row} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
