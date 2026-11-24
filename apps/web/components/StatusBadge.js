import { copy } from '@/copy/en'
import Badge from '@/components/Badge'
import { STATUS_BADGES } from '@/lib/status'

/** A booking status as an icon and a word. Add a new status in lib/status.js and copy/en.js. */
export default function StatusBadge({ status }) {
  const { tone, icon } = STATUS_BADGES[status]
  return (
    <Badge tone={tone} icon={icon}>
      {copy.status[status]}
    </Badge>
  )
}
