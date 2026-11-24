import Eyebrow from '@/components/Eyebrow'
import Reveal from '@/components/Reveal'
import { copy } from '@/copy/en'

/** Numbered steps joined by a line on larger screens. With no props it is the home page's "How it works". */
export default function Journey({
  eyebrow = copy.home.eyebrows.how,
  title = copy.home.howTitle,
  steps = copy.home.steps,
}) {
  return (
    <section id="how" className="scroll-mt-24">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mb-6 text-title-2 md:text-title-1">{title}</h2>
      <ol className="relative grid gap-4 md:grid-cols-3 md:gap-6">
        <span
          aria-hidden="true"
          className="absolute left-[16%] right-[16%] top-10 hidden border-t border-dashed border-separator md:block"
        />
        {steps.map((step, index) => (
          <li key={step.title}>
            <Reveal delay={index * 60} className="h-full">
              <div className="relative h-full rounded-panel border border-separator bg-surface p-5 shadow-1 md:p-6">
                <span className="num mb-4 flex size-10 items-center justify-center rounded-pill bg-primary text-callout font-semibold text-on-primary">
                  {index + 1}
                </span>
                <h3 className="text-headline">{step.title}</h3>
                <p className="mt-1 text-callout text-label-2">{step.text}</p>
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  )
}
