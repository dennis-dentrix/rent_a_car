import Skeleton from '@/components/Skeleton'

/** The shape of a page while it loads: a heading and a few panels, so the screen answers a tap at once. */
export default function PageLoading() {
  return (
    <div className="flex flex-col gap-5" aria-busy="true">
      <Skeleton className="h-9 w-1/2 max-w-xs" />
      {Array.from({ length: 3 }, (_, index) => (
        <Skeleton key={index} className="h-28 w-full" />
      ))}
    </div>
  )
}
