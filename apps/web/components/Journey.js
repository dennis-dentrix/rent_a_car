import RuledItem from '@/components/RuledItem'
import SectionHeading from '@/components/SectionHeading'
import { copy } from '@/copy/en'
import { cx } from '@/lib/cx'

/** Steps in order. With no props it is the home page's "How it works". */
export default function Journey({ title = copy.home.howTitle, steps = copy.home.steps }) {
  return (
    <section id="how" className="scroll-mt-24">
      <SectionHeading title={title} />
      <ol
        className={cx(
          'grid gap-8',
          steps.length === 4 ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-3',
        )}
      >
        {steps.map((step, index) => (
          <li key={step.title}>
            <RuledItem kicker={copy.home.stepLabel(index + 1)} {...step} />
          </li>
        ))}
      </ol>
    </section>
  )
}
