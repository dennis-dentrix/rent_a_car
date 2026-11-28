import Link from 'next/link'
import { Users } from 'lucide-react'
import Badge from '@/components/Badge'
import Price from '@/components/Price'
import TagList from '@/components/TagList'
import CarPhoto from '@/components/CarPhoto'
import NoPhoto from '@/components/NoPhoto'
import { copy } from '@/copy/en'
import { cx } from '@/lib/cx'
import { classPhoto } from '@/lib/photos'

function Availability({ count }) {
  if (count === undefined) return null
  return count > 0 ? (
    <Badge tone="success">{copy.cars.available(count)}</Badge>
  ) : (
    <Badge>{copy.cars.notAvailable}</Badge>
  )
}

function PriceLine({ kes }) {
  return (
    <span className="flex flex-col">
      <span className="text-caption uppercase text-label-2">{copy.cars.from}</span>
      <span>
        <Price kes={kes} className="text-price text-primary" />
        <span className="ml-1 text-footnote text-label-2">{copy.cars.perDay}</span>
      </span>
    </span>
  )
}

const CARD_SIZES = '(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 80vw'

function Picture({ item }) {
  const photo = classPhoto(item)
  if (photo) {
    return (
      <div className="relative aspect-[16/10] overflow-hidden bg-fill">
        <CarPhoto src={photo} alt={item.name} sizes={CARD_SIZES} />
      </div>
    )
  }
  return (
    <div className="flex aspect-[16/10] items-center justify-center bg-fill">
      <NoPhoto />
    </div>
  )
}

function Details({ item }) {
  return (
    <div className="flex flex-1 flex-col gap-3 p-4 md:p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-title-2">{item.name}</h3>
        <span className="mt-1 flex items-center gap-1 text-callout text-label-2">
          <Users size={16} className="text-primary" aria-hidden="true" />
          <span aria-hidden="true">{item.seats}</span>
          <span className="sr-only">{copy.cars.seats(item.seats)}</span>
        </span>
      </div>
      <TagList tags={item.best_for} />
      <div className="mt-auto flex items-end justify-between gap-3 pt-2">
        <PriceLine kes={item.price_per_day_kes} />
        <Availability count={item.available_count} />
      </div>
    </div>
  )
}

/** One car type: a picture, name, seats, what it suits, and the daily price. With `href` the whole card is one link. */
export default function ClassCard({ item, href }) {
  const Wrapper = href ? Link : 'div'
  return (
    <Wrapper
      href={href}
      className={cx(
        'flex h-full flex-col overflow-hidden rounded-panel border border-separator bg-surface',
        href &&
          'transition-[border-color,transform] duration-fast hover:border-primary active:scale-[0.99]',
      )}
    >
      <Picture item={item} />
      <Details item={item} />
    </Wrapper>
  )
}
