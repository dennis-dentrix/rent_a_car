'use client'

import { BARE, labelIdFor } from '@/components/SearchCell'
import { cx } from '@/lib/cx'

/** The button inside a search cell that opens a picker sheet; muted while nothing is chosen. */
export default function CellButton({ id, isEmpty, onClick, children }) {
  return (
    <button
      id={id}
      type="button"
      aria-labelledby={`${labelIdFor(id)} ${id}`}
      onClick={onClick}
      className={cx(BARE, 'text-left', isEmpty && 'font-normal text-label-3')}
    >
      {children}
    </button>
  )
}
