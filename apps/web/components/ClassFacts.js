import TagList from '@/components/TagList'
import { copy } from '@/copy/en'

function Fact({ label, value }) {
  return (
    <div>
      <dt className="text-footnote text-label-2">{label}</dt>
      <dd className="num text-title-2">{value}</dd>
    </div>
  )
}

/** Seats, luggage, and what the car type suits: only what the API holds, and nothing when a field is empty. */
export default function ClassFacts({ item, detail }) {
  const text = copy.classPage.facts
  return (
    <div className="flex flex-col gap-4">
      <dl className="flex flex-wrap gap-x-8 gap-y-4">
        <Fact label={text.seats} value={item.seats} />
        {detail.luggage_capacity != null && (
          <Fact label={text.luggage} value={detail.luggage_capacity} />
        )}
      </dl>
      {item.best_for.length > 0 && (
        <div>
          <p className="mb-2 text-footnote text-label-2">{text.bestFor}</p>
          <TagList tags={item.best_for} className="gap-2" />
        </div>
      )}
    </div>
  )
}
