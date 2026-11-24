'use client'

import { useId, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CarFront, MapPin, Search, Tag } from 'lucide-react'
import { copy } from '@/copy/en'
import { cx } from '@/lib/cx'
import { filterSuggestions, textSearchHref } from '@/lib/suggestions'
import { useDismiss } from '@/lib/use-dismiss'

const KIND_ICONS = { service: Tag, car: CarFront, place: MapPin }

function Option({ id, item, isActive, onChoose }) {
  const Icon = item.icon ?? KIND_ICONS[item.kind]
  return (
    <li
      id={id}
      role="option"
      aria-selected={isActive}
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => onChoose(item)}
      className={cx(
        'flex min-h-touch cursor-pointer items-center gap-3 rounded-control px-3 text-body',
        isActive && 'bg-accent-subtle',
      )}
    >
      <Icon size={18} className="shrink-0 text-primary" aria-hidden="true" />
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {item.kind !== 'text' && (
        <span className="shrink-0 text-footnote text-label-2">
          {copy.headerSearch.kinds[item.kind]}
        </span>
      )}
    </li>
  )
}

// What Enter and the arrow keys do. With nothing highlighted, Enter searches the text as typed.
function useSuggestKeys({ results, active, setActive, text, go, close }) {
  return (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const step = event.key === 'ArrowDown' ? 1 : -1
      setActive((now) => Math.max(0, Math.min(results.length - 1, now + step)))
    } else if (event.key === 'Enter' && text.trim()) {
      event.preventDefault()
      go(results[active])
    } else if (event.key === 'Escape') {
      close()
    }
  }
}

// The state behind the box: the typed text, the highlighted result, and where each choice leads.
function useSuggestBox({ suggestions, onDone }) {
  const router = useRouter()
  const root = useRef(null)
  const [text, setText] = useState('')
  const [active, setActive] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  const typed = text.trim()
  const asText = {
    kind: 'text',
    icon: Search,
    label: copy.headerSearch.searchFor(typed),
    href: textSearchHref(text),
  }
  const results = typed ? [...filterSuggestions(suggestions, text), asText] : []
  const close = () => setIsOpen(false)
  const go = (item) => {
    close()
    setText('')
    onDone?.()
    router.push(item.href)
  }
  useDismiss(root, isOpen, close)
  const onKeyDown = useSuggestKeys({ results, active, setActive, text, go, close })
  const change = (value) => {
    setText(value)
    setActive(0)
    setIsOpen(true)
  }
  return { root, text, change, active, isOpen, setIsOpen, results, go, onKeyDown }
}

function SuggestInput({ box, listId, isAutoFocus }) {
  const isShowing = box.isOpen && box.results.length > 0
  return (
    <div className="flex min-h-compact items-center gap-2 rounded-pill bg-fill px-4 focus-within:ring-2 focus-within:ring-accent">
      <Search size={18} className="shrink-0 text-label-2" aria-hidden="true" />
      <input
        type="search"
        role="combobox"
        aria-expanded={isShowing}
        aria-controls={listId}
        aria-activedescendant={isShowing ? `${listId}-${box.active}` : undefined}
        aria-label={copy.headerSearch.open}
        autoFocus={isAutoFocus}
        value={box.text}
        placeholder={copy.headerSearch.placeholder}
        onChange={(event) => box.change(event.target.value)}
        onFocus={() => box.setIsOpen(true)}
        onKeyDown={box.onKeyDown}
        className="min-w-0 flex-1 bg-transparent py-2 text-body focus-visible:outline-none"
      />
    </div>
  )
}

/**
 * A search box that suggests services, car types, and places as you type, and takes any text as a name
 * search. `isPopover` floats the list under the box (the header); otherwise it sits in the page flow
 * (inside the phone sheet).
 */
export default function SuggestBox({
  suggestions,
  isPopover = false,
  isAutoFocus = false,
  onDone,
}) {
  const listId = useId()
  const box = useSuggestBox({ suggestions, onDone })
  return (
    <div ref={box.root} className="relative w-full">
      <SuggestInput box={box} listId={listId} isAutoFocus={isAutoFocus} />
      {box.isOpen && box.results.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          aria-label={copy.headerSearch.results}
          className={cx(
            'mt-2 rounded-panel border border-separator bg-surface p-1 shadow-2',
            isPopover &&
              'animate-pop-in absolute right-0 top-full z-sheet w-[22rem] max-w-[90vw] origin-top',
          )}
        >
          {box.results.map((item, index) => (
            <Option
              key={`${item.kind}-${item.label}`}
              id={`${listId}-${index}`}
              item={item}
              isActive={index === box.active}
              onChoose={box.go}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
