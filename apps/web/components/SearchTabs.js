'use client'

import { CarFront, PartyPopper, Plane } from 'lucide-react'
import { SERVICE_GROUP_IDS } from '@carvo/shared'
import { copy } from '@/copy/en'
import { cx } from '@/lib/cx'

const ICONS = { car_hire: CarFront, transfers: Plane, events: PartyPopper }

/** The service lines as tabs: car hire, transfers, events. Swipeable on a narrow phone. */
export default function SearchTabs({ value, onChange }) {
  return (
    <div role="tablist" aria-label={copy.search.tabsLabel} className="flex gap-1 md:gap-2">
      {SERVICE_GROUP_IDS.map((group) => {
        const Icon = ICONS[group]
        const isSelected = group === value
        return (
          <button
            key={group}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => onChange(group)}
            className={cx(
              'state-layer flex min-h-touch flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-pill border px-1 text-callout font-semibold transition-[transform,background-color,border-color,color] duration-fast active:scale-[0.97] md:flex-none md:gap-2 md:px-4',
              isSelected
                ? 'border-primary bg-accent-subtle text-primary'
                : 'border-transparent text-label-2 hover:text-label',
            )}
          >
            <Icon size={20} className="hidden shrink-0 min-[400px]:block" aria-hidden="true" />
            {copy.services.groups[group].label}
          </button>
        )
      })}
    </div>
  )
}
