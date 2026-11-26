import LargeTitle from '@/components/LargeTitle'
import ResultsGrid from '@/components/ResultsGrid'
import Skeleton from '@/components/Skeleton'
import { copy } from '@/copy/en'

// Same shape as the results, so the page does not jump when they arrive.
export default function Loading() {
  return (
    <>
      <LargeTitle subtitle={copy.cars.subtitle}>{copy.cars.title}</LargeTitle>
      <div className="lg:pl-[19.5rem]" aria-hidden="true">
        <ResultsGrid>
          {Array.from({ length: 6 }, (_, index) => (
            <li key={index}>
              <Skeleton className="aspect-[3/4] w-full" />
            </li>
          ))}
        </ResultsGrid>
      </div>
    </>
  )
}
