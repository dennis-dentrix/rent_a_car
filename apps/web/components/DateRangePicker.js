'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { isBlocked, monthGrid, pickDay, pickSingleDay } from '@/lib/calendar'
import { copy } from '@/copy/en'
import { cx } from '@/lib/cx'

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const monthTitle = new Intl.DateTimeFormat('en-KE', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

function dayClasses({ iso, start, end, isOff }) {
  const isEdge = iso === start || iso === end
  const isBetween = start && end && iso > start && iso < end
  return cx(
    'num flex h-touch items-center justify-center text-body',
    isEdge && 'rounded-control bg-accent font-semibold text-on-accent',
    isBetween && 'bg-accent-subtle text-accent',
    isOff && 'text-label-3 line-through opacity-60',
  )
}

function MonthHeader({ title, onPrevious, onNext }) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <button
        type="button"
        aria-label={copy.a11y.previousMonth}
        onClick={onPrevious}
        className="p-3"
      >
        <ChevronLeft size={20} aria-hidden="true" />
      </button>
      <p className="text-headline" aria-live="polite">
        {title}
      </p>
      <button type="button" aria-label={copy.a11y.nextMonth} onClick={onNext} className="p-3">
        <ChevronRight size={20} aria-hidden="true" />
      </button>
    </div>
  )
}

function DayGrid({ view, range, minDate, blockedRanges, isSingle, onChange }) {
  return (
    <div className="grid grid-cols-7">
      {monthGrid(view.year, view.month)
        .flat()
        .map((iso, index) => {
          if (!iso) return <span key={`blank-${index}`} />
          const isOff = iso < minDate || isBlocked(iso, blockedRanges)
          return (
            <button
              key={iso}
              type="button"
              disabled={isOff}
              aria-label={iso}
              aria-pressed={iso === range.start || iso === range.end}
              onClick={() =>
                onChange(isSingle ? pickSingleDay(iso) : pickDay(range, iso, blockedRanges))
              }
              className={dayClasses({ iso, ...range, isOff })}
            >
              {Number(iso.slice(8))}
            </button>
          )
        })}
    </div>
  )
}

/**
 * A touch-first range calendar. Blocked days and days before `minDate` cannot be picked. The component holds
 * no business numbers: the service supplies the blocked ranges and the minimum date.
 */
export default function DateRangePicker({
  start,
  end,
  minDate,
  blockedRanges = [],
  isSingle = false,
  onChange,
}) {
  const [view, setView] = useState(() => {
    const anchor = new Date(`${start ?? minDate}T00:00:00Z`)
    return { year: anchor.getUTCFullYear(), month: anchor.getUTCMonth() }
  })
  const move = (step) => {
    const next = new Date(Date.UTC(view.year, view.month + step, 1))
    setView({ year: next.getUTCFullYear(), month: next.getUTCMonth() })
  }
  const title = monthTitle.format(new Date(Date.UTC(view.year, view.month, 1)))

  return (
    <div role="group" aria-label={copy.a11y.chooseDates}>
      <MonthHeader title={title} onPrevious={() => move(-1)} onNext={() => move(1)} />
      <div className="grid grid-cols-7 text-center text-caption text-label-2" aria-hidden="true">
        {WEEKDAYS.map((day, index) => (
          <span key={index}>{day}</span>
        ))}
      </div>
      <DayGrid
        view={view}
        range={{ start, end }}
        minDate={minDate}
        blockedRanges={blockedRanges}
        isSingle={isSingle}
        onChange={onChange}
      />
    </div>
  )
}
