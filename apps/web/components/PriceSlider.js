'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatMoney } from '@carvo/shared'
import { copy } from '@/copy/en'
import { withParams } from '@/lib/query'

const text = copy.liveCars.filters

/** The highest daily price a renter will pay. The list updates when the slider is let go, not while it moves. */
export default function PriceSlider({ lowest, highest, params }) {
  const router = useRouter()
  const [value, setValue] = useState(Number(params.max) || highest)
  const apply = () => {
    const max = value >= highest ? '' : String(value)
    router.push(withParams('/cars', { ...params, max }), { scroll: false })
  }
  return (
    <div className="flex flex-col gap-1">
      <span className="num text-callout font-semibold text-primary">
        {text.upTo(formatMoney(value))}
      </span>
      <input
        type="range"
        aria-label={text.price}
        min={lowest}
        max={highest}
        step="500"
        value={value}
        onChange={(event) => setValue(Number(event.target.value))}
        onPointerUp={apply}
        onKeyUp={apply}
        className="min-h-touch w-full accent-primary"
      />
      <span className="num flex justify-between text-footnote text-label-2">
        <span>{formatMoney(lowest)}</span>
        <span>{formatMoney(highest)}</span>
      </span>
    </div>
  )
}
