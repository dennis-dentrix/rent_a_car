import Price from '@/components/Price'
import { copy } from '@/copy/en'

const text = copy.liveCars

/** The daily price in large figures, with the total underneath once there are dates. */
export default function ResultPrice({ car }) {
  // The website and the API are deployed separately: a price the API does not send yet is left out.
  if (!car.daily_rate_kes) return null
  return (
    <div>
      <p className="text-caption uppercase text-label-2">{text.rate}</p>
      <p className="text-price text-primary">
        <Price kes={car.daily_rate_kes} />{' '}
        <span className="text-footnote text-label-2">{text.perDay}</span>
      </p>
      {car.total_kes !== undefined && (
        <p className="text-footnote text-label-2">
          {text.total(car.days)} <Price kes={car.total_kes} className="font-semibold text-label" />
        </p>
      )}
    </div>
  )
}
