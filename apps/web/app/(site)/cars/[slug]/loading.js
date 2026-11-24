import Skeleton from '@/components/Skeleton'

// The shape of the car type page, so nothing jumps when it arrives.
export default function Loading() {
  return (
    <div aria-hidden="true" className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
      <div className="flex flex-col gap-4">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="aspect-[16/8] w-full" />
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-5 w-1/2" />
      </div>
      <Skeleton className="h-80 w-full" />
    </div>
  )
}
