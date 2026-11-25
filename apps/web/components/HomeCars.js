import Button from '@/components/Button'
import LiveCarCard from '@/components/LiveCarCard'
import SectionHeading from '@/components/SectionHeading'
import { copy } from '@/copy/en'

const text = copy.liveCars.home
const SHOWN = 3

/** The newest real cars, on the home page. Nothing is shown until a company has listed one. */
export default function HomeCars({ cars }) {
  if (!cars.length) return null
  const seeAll = (
    <Button href="/cars" variant="plain" size="compact" className="shrink-0 whitespace-nowrap">
      {text.seeAll}
    </Button>
  )
  return (
    <section>
      <SectionHeading title={text.title} action={seeAll}>
        {text.text}
      </SectionHeading>
      <ul className="stagger grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {cars.slice(0, SHOWN).map((car) => (
          <LiveCarCard key={car.id} car={car} />
        ))}
      </ul>
    </section>
  )
}
