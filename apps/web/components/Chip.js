'use client'

import Link from 'next/link'
import { Check, X } from 'lucide-react'
import { copy } from '@/copy/en'
import { cx } from '@/lib/cx'

// Pressing a chip shrinks it a little: the interface answers the touch before anything else happens.
const INNER =
  'state-layer inline-flex min-h-touch items-center gap-1 rounded-pill transition-transform duration-fast active:scale-[0.97]'

/**
 * A filter or choice. Selected shows a tint and a check (never colour alone). It is a button that
 * toggles state, or a link (`href`) when choosing it changes the page. Pass `onRemove` for an
 * active-filter chip with a dismiss button.
 */
export default function Chip({ label, isSelected = false, onToggle, onRemove, href }) {
  const content = (
    <>
      {isSelected && <Check size={16} aria-hidden="true" />}
      {label}
    </>
  )
  return (
    <span
      className={cx(
        'inline-flex min-h-touch items-center gap-1 rounded-pill border px-4 text-callout font-medium',
        isSelected
          ? 'border-transparent bg-accent-subtle text-accent'
          : 'border-separator text-label',
      )}
    >
      {href ? (
        <Link href={href} aria-current={isSelected ? 'true' : undefined} className={INNER}>
          {content}
        </Link>
      ) : (
        <button type="button" aria-pressed={isSelected} onClick={onToggle} className={INNER}>
          {content}
        </button>
      )}
      {onRemove && (
        <button
          type="button"
          aria-label={copy.a11y.remove(label)}
          onClick={onRemove}
          className="p-1"
        >
          <X size={16} aria-hidden="true" />
        </button>
      )}
    </span>
  )
}
