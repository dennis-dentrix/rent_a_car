import { ShieldCheck } from 'lucide-react'
import ArcBackdrop from '@/components/ArcBackdrop'
import { copy } from '@/copy/en'
import { cx } from '@/lib/cx'

/** The navy brand panel at the top of a page. The search card overlaps its lower edge. */
export default function Hero({
  badge = copy.home.badge,
  title = copy.home.title,
  subtitle = copy.home.subtitle,
  hasSearchBelow = true,
  children,
}) {
  return (
    <section className="relative isolate overflow-hidden rounded-sheet bg-hero text-on-hero">
      <ArcBackdrop className="pointer-events-none absolute -right-20 -top-20 -z-10 w-[260px] text-on-hero md:-right-10 md:-top-24 md:w-[520px]" />
      <div
        className={cx(
          'px-5 pt-10 md:px-12 md:pt-14',
          hasSearchBelow ? 'pb-20 md:pb-24' : 'pb-10 md:pb-14',
        )}
      >
        <p className="mb-5 inline-flex items-center gap-2 rounded-pill bg-hero-glass px-3 py-1.5 text-caption">
          <ShieldCheck size={14} aria-hidden="true" />
          {badge}
        </p>
        <h1 className="max-w-xl text-display md:text-display-lg">{title}</h1>
        <p className="mt-4 max-w-lg text-body text-on-hero-2 md:text-headline md:font-normal">
          {subtitle}
        </p>
        {children && <div className="mt-6 flex flex-wrap gap-3">{children}</div>}
      </div>
    </section>
  )
}
