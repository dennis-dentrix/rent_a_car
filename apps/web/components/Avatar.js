import Image from 'next/image'
import { cx } from '@/lib/cx'
import { initialsOf } from '@/lib/avatar'

/** A person's picture in a circle, or their initials when they have not added one. `size` is in pixels. */
export default function Avatar({ name, src, size = 32, className }) {
  const box = { width: size, height: size }
  return (
    <span
      className={cx(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-pill bg-accent-subtle font-semibold text-primary',
        className,
      )}
      style={{ ...box, fontSize: size * 0.4 }}
      aria-hidden="true"
    >
      {src ? (
        <Image src={src} alt="" {...box} className="h-full w-full object-cover" />
      ) : (
        initialsOf(name)
      )}
    </span>
  )
}
