import { nairobiDate } from '@carvo/shared'
import { removeBlockAction } from '@/app/console/calendar-actions'
import AdminDecision from '@/components/AdminDecision'
import PanelList from '@/components/PanelList'
import { copy } from '@/copy/en'
import { formatStayRange } from '@/lib/stay-range'

const text = copy.calendar
const REMOVE = [{ value: 'remove', label: text.remove, variant: 'tonal' }]

// A block ends at the midnight after its last day.
const lastDay = (end) => nairobiDate(new Date(Date.parse(end) - 1))

/** The blocked periods, each with the button that frees it. */
export default function BlockList({ blocks, carNames }) {
  const sorted = [...blocks].sort((a, b) => a.start_at.localeCompare(b.start_at))
  return (
    <PanelList isEmpty={sorted.length === 0} empty={text.noBlocks}>
      {sorted.map((block) => (
        <li key={block.id} className="py-3">
          <p className="text-cell font-semibold">{carNames.get(block.vehicle_id)}</p>
          <p className="text-footnote text-label-2">
            {[
              formatStayRange({ start: nairobiDate(block.start_at), end: lastDay(block.end_at) }),
              block.note,
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
          <AdminDecision
            action={removeBlockAction}
            id={block.id}
            answerName="answer"
            answers={REMOVE}
          />
        </li>
      ))}
    </PanelList>
  )
}
