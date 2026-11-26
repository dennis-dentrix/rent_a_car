'use client'

import { useEffect, useState } from 'react'
import { CalendarDays } from 'lucide-react'
import Button from '@/components/Button'
import CellButton from '@/components/CellButton'
import SearchCell from '@/components/SearchCell'
import Sheet from '@/components/Sheet'
import StayPicker from '@/components/StayPicker'
import { copy } from '@/copy/en'
import { formatStayRange, hireDays } from '@/lib/stay-range'
import { formatTimeLabel } from '@/lib/stay-times'

/** A one-line summary such as "3 days · 9:00 am to 6:00 pm", or null before dates are chosen. */
export function staySummary(stay) {
  if (!stay.start) return null
  return copy.search.summary(
    copy.search.days(hireDays(stay)),
    formatTimeLabel(stay.startTime),
    formatTimeLabel(stay.endTime),
  )
}

function DatesSheet({ isOpen, onClose, stay, onChange }) {
  return (
    <Sheet isOpen={isOpen} onClose={onClose} title={copy.search.datesTitle}>
      <StayPicker value={stay} onChange={onChange} />
      <Button isFullWidth className="mt-5" disabled={!stay.start} onClick={onClose}>
        {copy.search.done}
      </Button>
    </Sheet>
  )
}

/**
 * The dates cell of the search strip: a button showing the chosen stay and its length, which opens the
 * picker sheet. `error` shows under the value when the customer searches without dates. `onDone` is told when the
 * sheet closes.
 */
export default function DatesField({ stay, onChange, onDone, error }) {
  const [isOpen, setIsOpen] = useState(false)
  const summary = staySummary(stay)
  // Searching without dates opens the picker, so the next step is obvious.
  useEffect(() => {
    if (error) setIsOpen(true)
  }, [error])
  return (
    <>
      <SearchCell
        icon={CalendarDays}
        label={copy.search.dates}
        error={error}
        onClear={stay.start ? () => onChange({ start: null, end: null }) : undefined}
      >
        {(id) => (
          <CellButton id={id} isEmpty={!stay.start} onClick={() => setIsOpen(true)}>
            {formatStayRange(stay) || copy.search.addDates}
            {summary && (
              <span className="num block text-footnote font-normal text-label-2">{summary}</span>
            )}
          </CellButton>
        )}
      </SearchCell>
      <DatesSheet
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false)
          onDone?.()
        }}
        stay={stay}
        onChange={onChange}
      />
    </>
  )
}
