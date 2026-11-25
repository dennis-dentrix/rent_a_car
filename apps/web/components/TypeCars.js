import LiveCarCard from '@/components/LiveCarCard'
import SectionHeading from '@/components/SectionHeading'
import { copy } from '@/copy/en'

/** The real cars of one car type, on its page. */
export default function TypeCars({ name, cars }) {
  if (!cars.length) return null
  return (
    <section>
      <SectionHeading title={copy.liveCars.ofType(name)} />
      <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {cars.map((car) => (
          <LiveCarCard key={car.id} car={car} />
        ))}
      </ul>
    </section>
  )
}
