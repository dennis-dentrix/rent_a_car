import { CLASS_GRID } from '@/components/ClassGrid'
import LargeTitle from '@/components/LargeTitle'
import Skeleton from '@/components/Skeleton'
import { copy } from '@/copy/en'

// Same shape as the results, so the page does not jump when they arrive.
export default function Loading() {
  return (
    <>
      <LargeTitle subtitle={copy.cars.subtitle}>{copy.cars.title}</LargeTitle>
      <ul className={CLASS_GRID} aria-hidden="true">
        {Array.from({ length: 4 }, (_, index) => (
          <li key={index} className="flex flex-col gap-3">
            <Skeleton className="aspect-[16/10] w-full" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-5 w-1/3" />
          </li>
        ))}
      </ul>
    </>
  )
}
