import SectionHeading from '@/components/SectionHeading'
import { copy } from '@/copy/en'

/** What goes into a price, set out like the lines of a quote, so nothing about the cost is a surprise. */
export default function PriceExplainer() {
  const { title, intro, lines } = copy.home.price
  return (
    <section className="grid md:grid-cols-[1fr_1.4fr] md:items-start md:gap-12">
      <SectionHeading title={title}>{intro}</SectionHeading>
      <dl className="divide-y divide-separator border-y border-separator">
        {lines.map((line) => (
          <div key={line.title} className="py-4">
            <dt className="text-headline">{line.title}</dt>
            <dd className="mt-1 text-reading text-label-2">{line.text}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
