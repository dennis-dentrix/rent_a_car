import Price from '@/components/Price'
import { copy } from '@/copy/en'

const text = copy.liveCars

/** The daily price a renter pays for the car's type, or that it is given on request. */
export default function CarRatePrice({ car }) {
  const rate = car.class?.daily_rate_kes
  if (!rate) return <p className="text-headline">{text.priceOnRequest}</p>
  return (
    <div>
      <p className="text-footnote text-label-2">{text.rateFrom}</p>
      <p className="text-price text-primary">
        <Price kes={rate} /> <span className="text-footnote text-label-2">{text.perDay}</span>
      </p>
    </div>
  )
}
