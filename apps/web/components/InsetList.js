import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

function Row({ item }) {
  const content = (
    <>
      <span className="min-w-0 flex-1">
        <span className="block text-body">{item.title}</span>
        {item.detail && <span className="block text-callout text-label-2">{item.detail}</span>}
      </span>
      {item.trailing}
      {(item.href || item.onSelect) && (
        <ChevronRight size={18} className="shrink-0 text-label-3" aria-hidden="true" />
      )}
    </>
  )
  const classes = 'state-layer flex min-h-touch w-full items-center gap-3 px-4 py-3 text-left'
  if (item.href) {
    return (
      <Link href={item.href} className={classes}>
        {content}
      </Link>
    )
  }
  if (item.onSelect) {
    return (
      <button type="button" onClick={item.onSelect} className={classes}>
        {content}
      </button>
    )
  }
  return <div className={classes}>{content}</div>
}

/** A rounded group with hairline separators: settings, bookings, documents. */
export default function InsetList({ items }) {
  return (
    <ul className="divide-y divide-separator overflow-hidden rounded-card border border-separator bg-surface">
      {items.map((item) => (
        <li key={item.id}>
          <Row item={item} />
        </li>
      ))}
    </ul>
  )
}
