import { brand } from '@rent-a-car/shared/brand'
import { ArrowRight, CalendarSearch, MessageCircle, Phone } from 'lucide-react'
import Link from 'next/link'
import ArcBackdrop from '@/components/ArcBackdrop'
import AskButton from '@/components/AskButton'
import { copy } from '@/copy/en'

// The same look for a link row and the button row that opens the question form.
const ROW_CLASS =
  'state-layer group flex w-full items-center gap-4 rounded-card bg-hero-glass p-4 text-left text-on-hero backdrop-blur-sm transition-transform duration-standard ease-standard hover:translate-x-1'
const TILE_CLASS = 'flex size-12 shrink-0 items-center justify-center rounded-card'

function RowContent({ icon: Icon, tile, title, text }) {
  return (
    <>
      <span className={`${TILE_CLASS} ${tile}`}>
        <Icon size={22} aria-hidden="true" />
      </span>
      <span className="flex-1">
        <span className="block text-headline">{title}</span>
        <span className="block text-callout text-on-hero-2">{text}</span>
      </span>
      <ArrowRight
        size={20}
        className="shrink-0 opacity-70 group-hover:opacity-100"
        aria-hidden="true"
      />
    </>
  )
}

/** The closing navy panel: a short pitch, and three ways to act. Questions are asked in the app, not elsewhere. */
export default function CtaBand() {
  const { title, text, actions } = copy.home.help
  const [dates, message, call] = actions
  return (
    <section className="relative isolate overflow-hidden rounded-sheet bg-hero p-6 text-on-hero md:p-12">
      <ArcBackdrop className="pointer-events-none absolute -left-20 -top-24 -z-10 w-72 text-on-hero md:w-[420px]" />
      <div className="grid gap-8 md:grid-cols-2 md:items-center md:gap-12">
        <div>
          <h2 className="text-title-1 md:text-display">{title}</h2>
          <p className="mt-3 max-w-md text-body text-on-hero-2">{text}</p>
        </div>
        <ul className="flex flex-col gap-3">
          <li>
            <Link href="#search" className={ROW_CLASS}>
              <RowContent icon={CalendarSearch} tile="bg-on-hero text-hero" {...dates} />
            </Link>
          </li>
          <li>
            <AskButton className={ROW_CLASS}>
              <RowContent icon={MessageCircle} tile="bg-hero-glass text-on-hero" {...message} />
            </AskButton>
          </li>
          <li>
            <Link href={`tel:${brand.supportPhone}`} className={ROW_CLASS}>
              <RowContent icon={Phone} tile="bg-hero-glass text-on-hero" {...call} />
            </Link>
          </li>
        </ul>
      </div>
    </section>
  )
}
