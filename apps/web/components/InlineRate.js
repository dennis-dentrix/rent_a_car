'use client'

import { Check, Pencil, X } from 'lucide-react'
import { useId, useState } from 'react'
import { formatMoney } from '@carvo/shared'
import { FIELD_CLASS } from '@/components/Field'
import { copy } from '@/copy/en'
import { cx } from '@/lib/cx'

const text = copy.adminFleet.rate
const SQUARE =
  'flex h-compact w-compact shrink-0 items-center justify-center rounded-control transition-transform duration-fast active:scale-[0.95]'

function Square({ label, onClick, tone, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cx(SQUARE, tone)}
    >
      {children}
    </button>
  )
}

// Enter keeps and Escape cancels. Both stop here, so Enter never sends the whole form and Escape never closes a drawer.
const keys = (keep, cancel) => (event) => {
  if (event.key !== 'Enter' && event.key !== 'Escape') return
  event.preventDefault()
  event.stopPropagation()
  if (event.key === 'Enter') keep()
  else cancel()
}

function Editor({ label, start, placeholder, onKeep, onCancel }) {
  const id = useId()
  const [draft, setDraft] = useState(String(start ?? ''))
  const keep = () => onKeep(draft.trim() === '' ? null : Number(draft))
  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        type="number"
        min="1"
        inputMode="numeric"
        autoFocus
        onFocus={(event) => event.target.select()}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={keys(keep, onCancel)}
        placeholder={placeholder}
        className={cx(FIELD_CLASS, 'num min-w-0 flex-1')}
      />
      <Square label={text.keep} onClick={keep} tone="bg-primary text-on-primary">
        <Check size={18} aria-hidden="true" />
      </Square>
      <Square label={text.cancel} onClick={onCancel} tone="bg-fill text-label">
        <X size={18} aria-hidden="true" />
      </Square>
    </div>
  )
}

/**
 * A car's daily price, with a pencil to change it. The tick keeps the new figure (an empty one removes the price) and
 * the cross leaves it as it was. `onKeep` receives the figure.
 */
export default function InlineRate({ label, value, onKeep }) {
  const [isEditing, setIsEditing] = useState(false)
  if (isEditing) {
    const keep = (next) => {
      setIsEditing(false)
      onKeep(next)
    }
    const editor = { label, start: value, placeholder: text.placeholder, onKeep: keep }
    return <Editor {...editor} onCancel={() => setIsEditing(false)} />
  }
  return (
    <div className="flex items-center justify-between gap-3">
      <p>
        <span className="num block text-headline">{value ? formatMoney(value) : text.notSet}</span>
        <span className="block text-footnote text-label-2">
          {value ? text.perDay : text.noPrice}
        </span>
      </p>
      <Square
        label={text.edit(label)}
        onClick={() => setIsEditing(true)}
        tone="bg-fill text-primary"
      >
        <Pencil size={16} aria-hidden="true" />
      </Square>
    </div>
  )
}
