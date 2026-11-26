'use client'

import { Plus, Search } from 'lucide-react'
import Button from '@/components/Button'
import { TYPED_TEXT } from '@/components/Field'
import { copy } from '@/copy/en'
import { cx } from '@/lib/cx'

const text = copy.consoleUi
const SEARCH_INPUT = cx('w-full bg-transparent outline-none placeholder:text-label-3', TYPED_TEXT)

function Pill({ isSelected, onClick, children }) {
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={onClick}
      className={cx(
        'inline-flex min-h-touch items-center whitespace-nowrap md:min-h-row rounded-pill px-3.5 text-meta font-semibold transition-transform duration-fast active:scale-[0.97]',
        isSelected ? 'bg-primary text-on-primary' : 'bg-bg-grouped text-label-2 hover:bg-fill',
      )}
    >
      {children}
    </button>
  )
}

/** Search, the "add" button, and filter pills with how many rows each would show. */
export default function TableToolbar({ query, onQuery, onAdd, pills, filter, onFilter }) {
  return (
    <div className="flex flex-col gap-3 px-5 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex min-h-compact w-full items-center gap-2 rounded-control bg-bg-grouped px-3 focus-within:ring-2 focus-within:ring-accent md:w-80">
          <Search size={16} className="text-label-2" aria-hidden="true" />
          <span className="sr-only">{text.search}</span>
          <input
            type="search"
            value={query}
            onChange={(event) => onQuery(event.target.value)}
            placeholder={text.search}
            className={SEARCH_INPUT}
          />
        </label>
        {onAdd && (
          <Button size="compact" onClick={onAdd}>
            <Plus size={16} aria-hidden="true" />
            {text.add}
          </Button>
        )}
      </div>
      {pills.length > 1 && (
        <div role="group" aria-label={text.filter} className="flex gap-2 overflow-x-auto">
          {pills.map((pill) => (
            <Pill
              key={pill.key}
              isSelected={pill.key === filter}
              onClick={() => onFilter(pill.key)}
            >
              {pill.label} ({pill.count})
            </Pill>
          ))}
        </div>
      )}
    </div>
  )
}
