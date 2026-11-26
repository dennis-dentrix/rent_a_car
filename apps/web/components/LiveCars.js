import { Car } from 'lucide-react'
import Button from '@/components/Button'
import EmptyState from '@/components/EmptyState'
import FilterRail from '@/components/FilterRail'
import ResultCard from '@/components/ResultCard'
import ResultsGrid from '@/components/ResultsGrid'
import SortSelect from '@/components/SortSelect'
import { copy } from '@/copy/en'
import { filterCars, sortCars } from '@/lib/live-cars'
import { carriedChoices } from '@/lib/stay-query'

const text = copy.liveCars

function NoCars() {
  return (
    <EmptyState
      icon={Car}
      title={copy.cars.emptyTitle}
      message={copy.cars.emptyText}
      action={
        <Button href="/cars" variant="tonal">
          {copy.cars.clear}
        </Button>
      }
    />
  )
}

/** The results: the filter rail at the side, then the matching cars as large cards in the chosen order. */
export default function LiveCars({ cars, params }) {
  const shown = sortCars(filterCars(cars, params), params.sort)
  return (
    <div className="grid gap-6 lg:grid-cols-[18rem_1fr] lg:items-start">
      <FilterRail cars={cars} params={params} />
      <section className="flex min-w-0 flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-title-2">
            {params.start ? text.availableFor(shown.length) : text.count(shown.length)}
          </h2>
          <SortSelect params={params} />
        </div>
        {shown.length === 0 && <NoCars />}
        <ResultsGrid>
          {shown.map((car) => (
            <ResultCard key={car.id} car={car} choices={carriedChoices(params)} />
          ))}
        </ResultsGrid>
      </section>
    </div>
  )
}
