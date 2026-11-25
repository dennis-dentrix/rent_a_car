import Image from 'next/image'
import { copy } from '@/copy/en'
import { cx } from '@/lib/cx'
import { isExamplePhoto } from '@/lib/media'

/**
 * A photograph filling its parent, which must be positioned and have a shape (an aspect ratio). Sized for the
 * screen. A stand-in photo says so, so nobody takes it for the car they will get.
 */
export default function CarPhoto({ src, alt, sizes, isPriority = false, className }) {
  return (
    <>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={isPriority}
        className={cx('object-cover', className)}
      />
      {isExamplePhoto(src) ? (
        <span className="absolute bottom-2 left-2 rounded-full bg-hero px-2 py-0.5 text-footnote font-semibold text-on-hero">
          {copy.cars.exampleImage}
        </span>
      ) : null}
    </>
  )
}
