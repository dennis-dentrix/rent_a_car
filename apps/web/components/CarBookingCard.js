import { MessageCircle, ShieldCheck } from 'lucide-react'
import ApprovedBy from '@/components/ApprovedBy'
import Button from '@/components/Button'
import CarBooking from '@/components/CarBooking'
import { copy } from '@/copy/en'
import { withParams } from '@/lib/query'
import { carriedChoices } from '@/lib/stay-query'

const text = copy.liveCars.page
export const BOOK_ID = 'book-this-car'

// Who rents the car out, with the way to ask them something right beside their name.
function Company({ car, query }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-separator pb-4">
      <ApprovedBy name={car.operator_name} />
      <Button
        href={withParams('/account/messages/new', { car: car.id, ...carriedChoices(query) })}
        variant="tonal"
        size="compact"
        className="shrink-0"
      >
        <MessageCircle size={18} aria-hidden="true" />
        {copy.messages.chat}
      </Button>
    </div>
  )
}

/** Who rents the car out, the dates, the price, and the way forward. It stays in view on a wide screen. */
export default function CarBookingCard({ car, query }) {
  return (
    <aside
      id={BOOK_ID}
      className="flex scroll-mt-24 flex-col gap-4 rounded-panel border border-separator bg-surface p-5 shadow-2 lg:sticky lg:top-24"
    >
      <Company car={car} query={query} />
      {/* A new address starts the choices afresh, so the picker never shows other dates than the price. */}
      <CarBooking key={`${query.start}-${query.end}`} car={car} query={query} />
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
