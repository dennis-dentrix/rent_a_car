'use client'

import { nairobiDate } from '@rent-a-car/shared'
import Chip from '@/components/Chip'
import DateRangePicker from '@/components/DateRangePicker'
import Select from '@/components/Select'
import { copy } from '@/copy/en'
import { fromTomorrow, weekend } from '@/lib/stay-presets'
import { TIME_OPTIONS } from '@/lib/stay-times'

const sameRange = (a, b) => a.start === b.start && a.end === b.end

// Shortcuts for the stays people ask for most. They need today's date, so they are built here on the
// client, when the sheet opens, and never frozen into the server-rendered page.
const presetsFor = (today) => [
  { key: 'weekend', ...weekend(today) },
  { key: 'week', ...fromTomorrow(today, 7) },
  { key: 'month', ...fromTomorrow(today, 30) },
]

function Presets({ today, value, onPick }) {
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {presetsFor(today).map((preset) => (
        <Chip
          key={preset.key}
          label={copy.search.presets[preset.key]}
          isSelected={sameRange(value, preset)}
          onToggle={() => onPick({ start: preset.start, end: preset.end })}
        />
      ))}
    </div>
  )
}

function Times({ value, onChange }) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-3">
      <Select
        label={copy.search.pickupTime}
        value={value.startTime}
        options={TIME_OPTIONS}
        onChange={(event) => onChange({ startTime: event.target.value })}
      />
      <Select
        label={copy.search.returnTime}
        value={value.endTime}
        options={TIME_OPTIONS}
        onChange={(event) => onChange({ endTime: event.target.value })}
      />
    </div>
  )
}

/** Shortcuts, a calendar, and pick-up and return times, all in one sheet. `value` is the whole stay. */
export default function StayPicker({ value, onChange }) {
  const today = nairobiDate(new Date())
  return (
    <div>
      <Presets today={today} value={value} onPick={onChange} />
      <DateRangePicker start={value.start} end={value.end} minDate={today} onChange={onChange} />
      <Times value={value} onChange={onChange} />
    </div>
  )
}
