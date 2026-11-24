'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/Button'
import DatesField from '@/components/DatesField'
import { copy } from '@/copy/en'
import { buildSearchUrl, emptySearch } from '@/lib/search-url'

/**
 * Dates for one car type: pick them, and /cars shows whether this car type is free, with the type already
 * chosen. Searching without dates opens the picker and says why, as the main search does.
 */
export default function ClassDates({ slug }) {
  const router = useRouter()
  const [stay, setStay] = useState(() => emptySearch().stay)
  const [hasTriedWithoutDates, setHasTriedWithoutDates] = useState(false)

  const change = (part) => {
    setStay((now) => ({ ...now, ...part }))
    setHasTriedWithoutDates(false)
  }
  const submit = (event) => {
    event.preventDefault()
    if (!stay.start) return setHasTriedWithoutDates(true)
    router.push(buildSearchUrl('car_hire', { ...emptySearch(), stay }, { class: slug }))
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-card border border-separator">
        <DatesField
          stay={stay}
          onChange={change}
          error={hasTriedWithoutDates ? copy.search.datesRequired : ''}
        />
      </div>
      <Button type="submit" isFullWidth>
        {copy.classPage.check}
      </Button>
    </form>
  )
}
