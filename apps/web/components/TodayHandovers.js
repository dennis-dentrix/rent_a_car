import Link from 'next/link'
import { formatMoney } from '@carvo/shared'
import Panel from '@/components/Panel'
import PanelList from '@/components/PanelList'
import { copy } from '@/copy/en'
import { momentText } from '@/lib/admin-format'

const text = copy.today

function Handover({ entry }) {
  const owed = entry.kind === 'pickup' && entry.owed_kes > 0
  return (
    <li>
      <Link
        href={`/console/bookings/${entry.id}`}
        className="state-layer flex min-h-touch flex-wrap items-center justify-between gap-3 py-3"
      >
        <span>
          <span className="block text-cell font-semibold">
            {text.kinds[entry.kind]} · {entry.car?.make} {entry.car?.model} · {entry.renter}
          </span>
          <span className="num block text-footnote text-label-2">
            {[momentText(entry.at), owed && text.owed(formatMoney(entry.owed_kes))]
              .filter(Boolean)
              .join(' · ')}
          </span>
        </span>
        <span className="text-cell font-semibold text-primary">{text.open}</span>
      </Link>
    </li>
  )
}

/** The cars being collected and returned today, in time order. */
export default function TodayHandovers({ handovers }) {
  return (
    <Panel title={text.handovers}>
      <PanelList isEmpty={handovers.length === 0} empty={text.noHandovers}>
        {handovers.map((entry) => (
          <Handover key={`${entry.kind}-${entry.id}`} entry={entry} />
        ))}
      </PanelList>
    </Panel>
  )
}
