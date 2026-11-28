'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { CarFront, Check, ChevronDown } from 'lucide-react'
import Dropdown from '@/components/Dropdown'
import { PICKER_TEXT } from '@/components/Field'
import { copy } from '@/copy/en'
import { cx } from '@/lib/cx'

// "Any car type", the one chosen, or the first with a count of the rest.
const summary = (options, chosen) => {
  const names = options
    .filter((option) => chosen.includes(option.value))
    .map((option) => option.label)
  if (names.length === 0) return copy.search.anyCarType
  return names.length === 1 ? names[0] : copy.search.carTypesMore(names[0], names.length - 1)
}

function TypeRow({ option, isSelected, onToggle }) {
  return (
    <li
      role="option"
      aria-selected={isSelected}
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(event) => (event.key === 'Enter' || event.key === ' ') && onToggle()}
      className={cx(
        'state-layer flex min-h-touch cursor-pointer items-center gap-3 rounded-control px-2 text-body',
        isSelected && 'bg-accent-subtle',
      )}
    >
      <span className="relative flex h-11 w-[4.5rem] shrink-0 items-center justify-center overflow-hidden rounded-control bg-fill">
        {option.photo && (
          <Image src={option.photo} alt="" fill sizes="72px" className="object-cover" />
        )}
      </span>
      <span className="flex-1 truncate font-medium">{option.label}</span>
      {isSelected && <Check size={18} className="shrink-0 text-primary" aria-hidden="true" />}
    </li>
  )
}

const PILL = cx(
  'state-layer relative flex min-h-compact max-w-full flex-wrap items-center gap-x-2 rounded-pill bg-fill pl-4 pr-3',
  PICKER_TEXT,
)

function TypeList({ options, value, onChange }) {
  const toggle = (slug) =>
    onChange(value.includes(slug) ? value.filter((item) => item !== slug) : [...value, slug])
  return (
    <>
      <ul role="listbox" aria-multiselectable="true" aria-label={copy.search.carTypeTitle}>
        {options.map((option) => (
          <TypeRow
            key={option.value}
            option={option}
            isSelected={value.includes(option.value)}
            onToggle={() => toggle(option.value)}
          />
        ))}
      </ul>
      {value.length > 0 && (
        <button
          type="button"
          onClick={() => onChange([])}
          className="state-layer mt-1 min-h-touch w-full rounded-control px-2 text-left text-callout font-medium text-primary"
        >
          {copy.search.clear}
        </button>
      )}
    </>
  )
}

/**
 * The car types a renter would take, as a pill beside the service: a dropdown of every type with a small drawing
 * of each. Choose one, several, or none for any. The same for car hire, transfers, and events.
 */
export default function CarTypePicker({ options, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const button = useRef(null)
  if (options.length === 0) return null
  return (
    <>
      <button
        ref={button}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className={PILL}
      >
        <CarFront size={16} className="shrink-0 text-primary" aria-hidden="true" />
        <span className="whitespace-nowrap text-label-2">{copy.search.carType}</span>
        <span className="min-w-0 truncate font-semibold">{summary(options, value)}</span>
        <ChevronDown size={16} className="shrink-0 text-label-2" aria-hidden="true" />
      </button>
      <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)} anchorRef={button}>
        <TypeList options={options} value={value} onChange={onChange} />
      </Dropdown>
    </>
  )
}
