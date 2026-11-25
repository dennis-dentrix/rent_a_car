'use client'

import { useEffect, useRef, useState } from 'react'
import InlineRate from '@/components/InlineRate'

/**
 * The car's price inside its form. It follows the class chosen in the same form, and the kept figure is sent when the
 * form is saved. An empty figure means the class rate.
 */
export default function RateField({ name, label, error, defaultValue, classId, rates }) {
  const [value, setValue] = useState(defaultValue || null)
  const [chosen, setChosen] = useState(classId)
  const box = useRef(null)

  useEffect(() => {
    const form = box.current.closest('form')
    const follow = (event) => event.target.name === 'class_id' && setChosen(event.target.value)
    form.addEventListener('change', follow)
    return () => form.removeEventListener('change', follow)
  }, [])

  return (
    <div ref={box} className="flex flex-col gap-1">
      <span className="text-callout font-semibold">{label}</span>
      <input type="hidden" name={name} value={value ?? ''} />
      <div className="rounded-control bg-bg-grouped p-3">
        <InlineRate label={label} value={value} fallback={rates[chosen]} onKeep={setValue} />
      </div>
      {error && <p className="text-footnote text-error">{error}</p>}
    </div>
  )
}
