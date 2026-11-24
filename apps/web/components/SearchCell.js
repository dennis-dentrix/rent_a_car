'use client'

import { useId } from 'react'
import { X } from 'lucide-react'
import { copy } from '@/copy/en'
import { cx } from '@/lib/cx'

// A control with no box of its own: the cell around it supplies the border, icon, and label.
export const BARE =
  'block w-full truncate bg-transparent text-body font-medium text-label placeholder:font-normal placeholder:text-label-3 focus-visible:outline-none'

/**
 * One field in the search strip: an icon, a small label, and the value, with an optional clear button.
 * `children` is called with the id that links the label to its control.
 */
export default function SearchCell({ icon: Icon, label, error, onClear, clearLabel, children }) {
  const id = useId()
  return (
    <div
      data-search-cell
      className={cx(
        'relative flex min-h-16 items-center gap-3 bg-surface px-4 py-2 focus-within:bg-bg-grouped',
      )}
    >
      <Icon size={22} className="shrink-0 text-label-2" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <label htmlFor={id} className="block text-caption text-label-2">
          {label}
        </label>
        {children(id)}
        {error && <p className="text-footnote text-error">{error}</p>}
      </div>
      {onClear && (
        <button
          type="button"
          aria-label={clearLabel ?? copy.search.clear}
          onClick={onClear}
          className="shrink-0 rounded-pill p-2 text-label-2 hover:bg-fill"
        >
          <X size={18} aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
