import ClassCard from '@/components/ClassCard'
import { cx } from '@/lib/cx'

// Shared with the loading skeleton so the two always have the same shape.
export const CLASS_GRID = 'grid gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3 wide:grid-cols-4'

// On a phone the cards sit in one swipeable row that snaps card by card, with the next card peeking in.
const CAROUSEL =
  '-mx-gutter flex snap-x snap-mandatory gap-4 overflow-x-auto px-gutter pb-2 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 lg:grid-cols-4 [&>li]:w-[78%] [&>li]:shrink-0 [&>li]:snap-start md:[&>li]:w-auto'

/** Car-type cards. `isCarousel` makes a swipeable row on phones; otherwise one column. */
export default function ClassGrid({ items, getHref, isCarousel = false }) {
  return (
    <ul className={cx(isCarousel ? CAROUSEL : CLASS_GRID, 'list-none')}>
      {items.map((item) => (
        <li key={item.id}>
          <ClassCard item={item} href={getHref?.(item)} />
        </li>
      ))}
    </ul>
  )
}
