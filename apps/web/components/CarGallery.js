import Image from 'next/image'
import { CarFront } from 'lucide-react'
import { copy } from '@/copy/en'
import { cx } from '@/lib/cx'
import { mediaUrl } from '@/lib/media'

const text = copy.liveCars

// A swipeable row on phones that snaps photo by photo; from tablet, a large cover with the rest beneath it.
const ROW =
  'relative -mx-gutter flex snap-x snap-mandatory gap-2 overflow-x-auto px-gutter md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0'
const SLIDE =
  'relative aspect-[4/3] w-[88%] shrink-0 snap-center overflow-hidden rounded-panel bg-fill md:w-auto'

function NoPhoto() {
  return (
    <div className="flex aspect-[16/10] flex-col items-center justify-center gap-2 rounded-panel bg-fill text-footnote text-label-3">
      <CarFront size={40} aria-hidden="true" />
      {text.noPhoto}
    </div>
  )
}

/** Every photo of one car. The first is the cover. */
export default function CarGallery({ paths, name }) {
  const sources = paths
    .map((path) => mediaUrl(path, process.env.NEXT_PUBLIC_MEDIA_BASE_URL))
    .filter(Boolean)
  if (!sources.length) return <NoPhoto />
  return (
    <ul className={ROW}>
      {sources.map((src, index) => (
        <li
          key={src}
          className={cx(
            SLIDE,
            index === 0 && 'md:col-span-3 md:aspect-[16/10]',
            sources.length === 1 && 'w-full',
          )}
        >
          <Image
            src={src}
            alt={text.page.photo(name, index + 1)}
            fill
            priority={index === 0}
            sizes={
              index === 0 ? '(min-width: 1024px) 60vw, 100vw' : '(min-width: 768px) 20vw, 88vw'
            }
            className="object-cover"
          />
        </li>
      ))}
    </ul>
  )
}
