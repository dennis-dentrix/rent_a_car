import { ShieldCheck } from 'lucide-react'
import ApprovedBy from '@/components/ApprovedBy'
import AskButton from '@/components/AskButton'
import Button from '@/components/Button'
import CarRatePrice from '@/components/CarRatePrice'
import { copy } from '@/copy/en'

const text = copy.liveCars.page
export const BOOK_ID = 'book-this-car'

/** The price, who rents the car out, and the two ways forward. It stays in view beside the details on a wide screen. */
export default function CarBookingCard({ car, name }) {
  const chauffeur = copy.carFacts.chauffeur[car.chauffeur_option]
  return (
    <aside
      id={BOOK_ID}
      className="flex scroll-mt-24 flex-col gap-4 rounded-panel border border-separator bg-surface p-5 shadow-2 lg:sticky lg:top-24"
    >
      <ApprovedBy name={car.operator_name} />
      <CarRatePrice car={car} />
      {chauffeur && <p className="text-callout text-label-2">{chauffeur}</p>}
      {car.class.daily_rate_kes && (
        <Button href={`/cars/${car.class.slug}`} isFullWidth>
          {text.seePrice}
        </Button>
      )}
      <AskButton
        variant={car.class.daily_rate_kes ? 'tonal' : 'primary'}
        classId={car.class.id}
        defaultMessage={text.askMessage(name, car.operator_name)}
      >
        {text.ask}
      </AskButton>
      <ul className="flex flex-col gap-2 border-t border-separator pt-4">
        {text.assurances.map((line) => (
          <li key={line} className="flex items-center gap-2 text-footnote text-label-2">
            <ShieldCheck size={16} className="shrink-0 text-primary" aria-hidden="true" />
            {line}
          </li>
        ))}
      </ul>
    </aside>
  )
}
