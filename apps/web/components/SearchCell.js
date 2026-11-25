'use client'

import { useId } from 'react'
import { X } from 'lucide-react'
import { TYPED_TEXT } from '@/components/Field'
import { copy } from '@/copy/en'
import { cx } from '@/lib/cx'

// A control with no box of its own: the cell around it supplies the border, icon, label, and focus ring. The
// weight is repeated for tablet up because the text size there brings its own.
export const BARE = cx(
  'block w-full truncate bg-transparent font-medium text-label md:font-medium',
  'placeholder:font-normal placeholder:text-label-3 focus-visible:outline-none',
  TYPED_TEXT,
)

/** The id of a cell's label, for a control that has to name it itself (a button, whose own text must stay heard). */
export const labelIdFor = (id) => `${id}-label`

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
        'focus-within:ring-2 focus-within:ring-inset focus-within:ring-accent',
      )}
    >
      <Icon size={22} className="shrink-0 text-label-2" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <label id={labelIdFor(id)} htmlFor={id} className="block text-caption text-label-2">
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
