import RuledItem from '@/components/RuledItem'
import { copy } from '@/copy/en'

const { label, points } = copy.home.trust

/** Why a renter can book here. Each point is something the product does today. */
export default function TrustPoints() {
  return (
    <section aria-label={label}>
      <ul className="grid gap-8 md:grid-cols-3">
        {points.map((point) => (
          <li key={point.title}>
            <RuledItem {...point} />
          </li>
        ))}
      </ul>
    </section>
  )
}
