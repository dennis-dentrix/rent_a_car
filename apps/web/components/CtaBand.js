import { brand } from '@carvo/shared/brand'
import ArcBackdrop from '@/components/ArcBackdrop'
import AskButton from '@/components/AskButton'
import Button from '@/components/Button'
import { copy } from '@/copy/en'

/** The closing panel: one question and three ways to act. Questions are asked in the app, not elsewhere. */
export default function CtaBand() {
  const { title, text, dates, message, call } = copy.home.help
  return (
    <section className="relative isolate overflow-hidden rounded-sheet bg-hero px-gutter-wide py-10 text-on-hero md:px-12 md:py-14 [&_:focus-visible]:outline-on-hero">
      <ArcBackdrop className="pointer-events-none absolute -right-24 -top-24 -z-10 w-72 text-on-hero md:-right-16 md:w-[26.25rem]" />
      <h2 className="max-w-xl text-display">{title}</h2>
      <p className="mt-3 max-w-md text-body text-on-hero-2">{text}</p>
      <div className="mt-6 flex flex-col gap-3 md:flex-row">
        <Button href="#search" variant="light">
          {dates}
        </Button>
        <AskButton variant="glass" isFullWidth={false}>
          {message}
        </AskButton>
        <Button href={`tel:${brand.supportPhone}`} variant="glass">
          {call}
        </Button>
      </div>
    </section>
  )
}
