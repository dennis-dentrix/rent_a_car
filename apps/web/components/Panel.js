import { cx } from '@/lib/cx'

/** A white card with an optional heading row. `isFlush` lets a table or list run to its edges. */
export default function Panel({ title, hint, action, isFlush = false, children }) {
  return (
    <section className="overflow-hidden rounded-panel border border-separator bg-surface shadow-1">
      {title && (
        <header className="flex flex-wrap items-center justify-between gap-3 px-5 pb-1 pt-4">
          <div>
            <h2 className="text-section">{title}</h2>
            {hint && <p className="text-meta text-label-2">{hint}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={cx(!isFlush && 'p-5', isFlush && title && 'pt-3')}>{children}</div>
    </section>
  )
}
