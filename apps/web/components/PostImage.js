import Image from 'next/image'
import { postImageUrl } from '@/lib/blog'

/**
 * A picture from a guide. The stored width and height reserve its room before it loads, so the text below
 * does not jump. Nothing is drawn when the media address is not set. `sizes` tells the browser how wide it
 * will be shown; `isPriority` is for the one picture a reader sees first.
 */
export default function PostImage({ image, sizes, isPriority = false, className }) {
  const src = postImageUrl(image)
  if (!src) return null
  return (
    <Image
      src={src}
      alt={image.alt_text}
      width={image.width}
      height={image.height}
      sizes={sizes}
      priority={isPriority}
      className={className}
    />
  )
}
