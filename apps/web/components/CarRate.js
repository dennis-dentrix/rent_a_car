'use client'

import { setCarRateAction } from '@/app/admin/car-actions'
import SavedRate from '@/components/SavedRate'
import { copy } from '@/copy/en'

/** The car's price on its own page. */
export default function CarRate({ car, value }) {
  return (
    <SavedRate
      label={copy.adminFleet.rate.label}
      value={value}
      save={(next) => setCarRateAction(car, next)}
    />
  )
}
