'use client'

import { useCallback, useRef, useState } from 'react'
import { Check } from 'lucide-react'
import IconButton from '@/components/IconButton'
import { cx } from '@/lib/cx'
import { useDismiss } from '@/lib/use-dismiss'

function MenuItem({ item, onChoose }) {
  const Icon = item.icon
  return (
    <button
      type="button"
      role="menuitemradio"
      aria-checked={item.isSelected}
      disabled={item.isDisabled}
      onClick={() => onChoose(item)}
      className={cx(
        'state-layer flex min-h-touch w-full items-center gap-3 rounded-control px-3 text-left text-body',
        'disabled:pointer-events-none disabled:opacity-40',
        item.isSelected && 'font-semibold',
      )}
    >
      {Icon && <Icon size={20} className="text-label-2" aria-hidden="true" />}
      <span className="flex-1">
        {item.label}
        {item.hint && (
          <span className="block text-footnote font-normal text-label-2">{item.hint}</span>
        )}
      </span>
      {item.isSelected && <Check size={18} className="text-accent" aria-hidden="true" />}
    </button>
  )
}

/**
 * A small popover menu anchored to a round button: closes on Escape, on a tap outside, or after a
 * choice, and gives focus back to the button. `triggerIcon` is an element, so it can change with state.
 */
export default function Menu({ label, triggerIcon, triggerClassName, items }) {
  const [isOpen, setIsOpen] = useState(false)
  const root = useRef(null)

  const dismiss = useCallback(({ isEscape }) => {
    setIsOpen(false)
    if (isEscape) root.current?.querySelector('button')?.focus()
  }, [])
  useDismiss(root, isOpen, dismiss)

  const choose = (item) => {
    item.onSelect()
    setIsOpen(false)
  }

  return (
    <div ref={root} className="relative">
      <IconButton
        label={label}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className={triggerClassName}
        onClick={() => setIsOpen(!isOpen)}
      >
        {triggerIcon}
      </IconButton>
      {isOpen && (
        <div
          role="menu"
          aria-label={label}
          className="animate-pop-in absolute right-0 top-full origin-top-right z-sheet mt-2 w-60 rounded-panel border border-separator bg-surface p-1 shadow-2"
        >
          {items.map((item) => (
            <MenuItem key={item.value} item={item} onChoose={choose} />
          ))}
        </div>
      )}
    </div>
  )
}
