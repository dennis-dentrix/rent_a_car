'use client'

import { ChevronDown, Tag } from 'lucide-react'
import { SERVICE_GROUPS } from '@rent-a-car/shared'
import Options from '@/components/Options'
import { copy } from '@/copy/en'

/** The services in the chosen line as a compact dropdown beside the tabs, so the strip holds only trip details. */
export default function ServicePicker({ group, value, onChange }) {
  const options = [
    { value: '', label: copy.services.anyService },
    ...SERVICE_GROUPS[group].map((id) => ({ value: id, label: copy.services.items[id] })),
  ]
  return (
    <label className="relative flex min-h-compact items-center gap-2 rounded-pill bg-fill pl-4 pr-3 text-callout font-medium focus-within:ring-2 focus-within:ring-accent">
      <Tag size={16} className="shrink-0 text-primary" aria-hidden="true" />
      <span className="text-label-2">{copy.search.service}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-0 appearance-none bg-transparent pr-5 font-semibold text-label focus-visible:outline-none"
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
