'use client'

import { cx } from '@/lib/cx'

function Pill({ index, count }) {
  return (
    <span
      aria-hidden="true"
      className="absolute inset-y-1 left-1 rounded-[6px] bg-surface shadow-1 transition-transform duration-standard ease-standard"
      style={{ width: `calc((100% - 8px) / ${count})`, transform: `translateX(${index * 100}%)` }}
    />
  )
}

/** Two to four exclusive choices. The pill slides under the selected option. */
export default function SegmentedControl({ label, options, value, onChange, isCompact = false }) {
  const index = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  )
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cx(
        'relative grid rounded-control bg-fill p-1',
        isCompact ? 'min-h-row' : 'min-h-touch',
      )}
      style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}
    >
      <Pill index={index} count={options.length} />
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          onClick={() => onChange(option.value)}
          className={cx(
            'relative z-10 rounded-[6px] px-3 text-callout font-semibold',
            option.value === value ? 'text-label' : 'text-label-2',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
