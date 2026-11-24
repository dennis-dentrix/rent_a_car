'use client'

import { useEffect, useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { nairobiDate } from '@rent-a-car/shared'
import Button from '@/components/Button'
import DateRangePicker from '@/components/DateRangePicker'
import CellButton from '@/components/CellButton'
import SearchCell from '@/components/SearchCell'
import Select from '@/components/Select'
import Sheet from '@/components/Sheet'
import { copy } from '@/copy/en'
import { formatStayRange } from '@/lib/stay-range'
import { TIME_OPTIONS, formatTimeLabel } from '@/lib/stay-times'

function DaySheet({ isOpen, onClose, value, onChange }) {
  return (
    <Sheet isOpen={isOpen} onClose={onClose} title={copy.search.dayTitle}>
      <DateRangePicker
        key={value.date || 'none'}
        start={value.date || null}
        end={value.date || null}
        minDate={nairobiDate(new Date())}
        isSingle
        onChange={({ start }) => onChange({ ...value, date: start })}
      />
      <div className="mt-4">
        <Select
          label={copy.search.time}
          value={value.time}
          options={TIME_OPTIONS}
          onChange={(event) => onChange({ ...value, time: event.target.value })}
        />
      </div>
      <Button isFullWidth className="mt-5" disabled={!value.date} onClick={onClose}>
        {copy.search.done}
      </Button>
    </Sheet>
  )
}

/**
 * The date and time of a one-day service (a transfer, a wedding): one cell that opens the same picker sheet
 * as car hire, with a time list under the calendar. `error` shows when the customer searches without a date.
 */
export default function DayField({ value, onChange, error }) {
  const [isOpen, setIsOpen] = useState(false)
  // Searching without a date opens the picker, so the next step is obvious.
  useEffect(() => {
    if (error) setIsOpen(true)
  }, [error])
  const text = value.date
    ? `${formatStayRange({ start: value.date })} · ${formatTimeLabel(value.time)}`
    : copy.search.addDate
  return (
    <>
      <SearchCell
        icon={CalendarDays}
        label={copy.search.dateTime}
        error={error}
        onClear={value.date ? () => onChange({ ...value, date: '' }) : undefined}
      >
        {(id) => (
          <CellButton id={id} isEmpty={!value.date} onClick={() => setIsOpen(true)}>
            {text}
          </CellButton>
        )}
      </SearchCell>
      <DaySheet
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        value={value}
        onChange={onChange}
      />
    </>
  )
}
