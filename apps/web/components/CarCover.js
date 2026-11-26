import Image from 'next/image'
import { CarFront } from 'lucide-react'
import { copy } from '@/copy/en'
import { cx } from '@/lib/cx'
import { mediaUrl } from '@/lib/media'

const text = copy.liveCars

/** A car's first photo with how many there are, or a plain "no photo" panel. `className` sets its shape. */
export default function CarCover({ car, name, sizes, className }) {
  const src = mediaUrl(car.photo_paths[0], process.env.NEXT_PUBLIC_MEDIA_BASE_URL)
  return (
    <div
      className={cx('relative flex items-center justify-center bg-fill text-label-3', className)}
    >
      {src ? (
        <Image src={src} alt={name} fill sizes={sizes} className="object-cover" />
      ) : (
        <span className="flex flex-col items-center gap-2 text-footnote">
          <CarFront size={32} aria-hidden="true" />
          {text.noPhoto}
        </span>
      )}
      {car.photo_paths.length > 1 && (
        <span className="num absolute bottom-3 right-3 rounded-pill bg-hero px-3 py-1 text-footnote text-on-hero">
          {text.photos(car.photo_paths.length)}
        </span>
      )}
    </div>
  )
}
