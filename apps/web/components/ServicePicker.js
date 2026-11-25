'use client'

import { ChevronDown, Tag } from 'lucide-react'
import { SERVICE_GROUPS } from '@carvo/shared'
import { PICKER_TEXT } from '@/components/Field'
import Options from '@/components/Options'
import { copy } from '@/copy/en'
import { cx } from '@/lib/cx'

/** The services in the chosen line as a compact dropdown beside the tabs, so the strip holds only trip details. */
export default function ServicePicker({ group, value, onChange }) {
  const options = [
    { value: '', label: copy.services.anyService },
    ...SERVICE_GROUPS[group].map((id) => ({ value: id, label: copy.services.items[id] })),
  ]
  return (
    <label
      className={cx(
        'relative flex min-h-compact max-w-full flex-wrap items-center gap-x-2 rounded-pill bg-fill pl-4 pr-3',
        'focus-within:ring-2 focus-within:ring-accent',
        PICKER_TEXT,
      )}
    >
      <Tag size={16} className="shrink-0 text-primary" aria-hidden="true" />
      <span className="whitespace-nowrap text-label-2">{copy.search.service}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-[6rem] flex-1 appearance-none truncate bg-transparent pr-5 font-semibold text-label focus-visible:outline-none"
      >
        <Options options={options} />
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3 text-label-2"
        aria-hidden="true"
      />
    </label>
  )
}
