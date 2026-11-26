import Price from '@/components/Price'
import { copy } from '@/copy/en'

const text = copy.liveCars

// What the total is made of, in the server's own figures.
function Makeup({ car, hasChauffeur }) {
  const addsChauffeur = hasChauffeur || car.chauffeur_option === 'chauffeur'
  return (
    <p className="text-footnote text-label-2">
      {text.forDays(car.days)} × <Price kes={car.daily_rate_kes} /> {text.perDay}
      {addsChauffeur && car.chauffeur_daily_kes > 0 && (
        <>
          {' '}
          + {text.chauffeur} <Price kes={car.chauffeur_daily_kes} /> {text.perDay}
        </>
      )}
    </p>
  )
}

/** What a car costs: the total for the chosen dates when there are any, otherwise its price per day. */
export default function CarRatePrice({ car, hasChauffeur }) {
  const isForDates = car.total_kes !== undefined
  // The website and the API are deployed separately: a price the API does not send yet is left out.
  if (!car.daily_rate_kes) return null
  return (
    <div>
      <p className="text-price text-primary">
        <Price kes={isForDates ? car.total_kes : car.daily_rate_kes} />{' '}
        {!isForDates && <span className="text-footnote text-label-2">{text.perDay}</span>}
      </p>
      {isForDates && <Makeup car={car} hasChauffeur={hasChauffeur} />}
    </div>
  )
}
