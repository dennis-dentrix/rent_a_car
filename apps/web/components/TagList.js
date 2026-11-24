import Badge from '@/components/Badge'
import { cx } from '@/lib/cx'

/** What a car type suits, as a row of small badges. Nothing is drawn when there are no tags. */
export default function TagList({ tags, className }) {
  if (tags.length === 0) return null
  return (
    <ul className={cx('flex flex-wrap gap-1', className)}>
      {tags.map((tag) => (
        <li key={tag}>
          <Badge tone="accent">{tag}</Badge>
        </li>
      ))}
    </ul>
  )
}
