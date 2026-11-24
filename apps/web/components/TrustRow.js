import { BadgeCheck, CalendarRange, ReceiptText } from 'lucide-react'
import IconTile from '@/components/IconTile'
import { copy } from '@/copy/en'

const TRUST = [
  { icon: BadgeCheck, tone: 'peach' },
  { icon: ReceiptText, tone: 'green' },
  { icon: CalendarRange, tone: 'blue' },
]

/** Three short promises under the search, each a small white card with a coloured icon. */
export default function TrustRow() {
  return (
    <ul className="grid gap-3 md:grid-cols-3 md:gap-4">
      {copy.home.trust.map((label, index) => (
        <li
          key={label}
          className="flex items-center gap-3 rounded-card border border-separator bg-surface p-3 text-callout font-medium shadow-1"
        >
          <IconTile {...TRUST[index]} />
          {label}
        </li>
      ))}
    </ul>
  )
}
