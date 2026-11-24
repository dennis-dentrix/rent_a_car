import AskButton from '@/components/AskButton'
import Card from '@/components/Card'
import ClassDates from '@/components/ClassDates'
import Price from '@/components/Price'
import { copy } from '@/copy/en'

export const DATES_ID = 'dates'

/** The price and the next step for one car type. Sticks beside the details on a wide screen. */
export default function ClassPriceCard({ item }) {
  const text = copy.classPage
  return (
    <Card id={DATES_ID} className="flex scroll-mt-28 flex-col gap-4 shadow-2 lg:sticky lg:top-28">
      {item.price_per_day_kes === null ? (
        <p className="text-callout text-label-2">{copy.cars.noRate}</p>
      ) : (
        <div>
          <p className="text-caption uppercase text-label-2">{text.from}</p>
          <p>
            <Price kes={item.price_per_day_kes} className="text-title-1 text-primary" />
            <span className="ml-1 text-callout text-label-2">{text.perDay}</span>
          </p>
        </div>
      )}
      <p className="text-footnote text-label-2">{text.deposit}</p>
      <h2 className="text-headline">{text.datesTitle}</h2>
      <ClassDates slug={item.slug} />
      <AskButton variant="tonal" classId={item.id} defaultMessage={text.askMessage(item.name)}>
        {text.ask}
      </AskButton>
    </Card>
  )
}
