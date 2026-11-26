'use client'

import { useState } from 'react'
import { copy } from '@/copy/en'

const text = copy.booking.confirm.handover

// Held in state so a refused submit does not untick what the renter chose.
function Choice({ name }) {
  const [isTicked, setIsTicked] = useState(false)
  return (
    <label className="flex min-h-touch items-center gap-3 text-body">
      <input
        type="checkbox"
        name={name}
        checked={isTicked}
        onChange={(event) => setIsTicked(event.target.checked)}
        className="h-5 w-5 shrink-0 accent-primary"
      />
      {text[name]}
    </label>
  )
}

/** Offered only for what the car's company does. Nothing is shown when it does neither. */
export default function HandoverChoices({ car }) {
  const offered = [
    car.offers_dropoff && 'wants_dropoff',
    car.offers_pickup && 'wants_pickup',
  ].filter(Boolean)
  if (!offered.length) return null
  return (
    <fieldset className="flex flex-col">
      <legend className="text-headline">{text.title}</legend>
      {offered.map((name) => (
        <Choice key={name} name={name} />
      ))}
      <p className="text-footnote text-label-2">{text.note}</p>
    </fieldset>
  )
}
