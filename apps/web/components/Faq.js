import { ChevronDown } from 'lucide-react'
import Eyebrow from '@/components/Eyebrow'
import { copy } from '@/copy/en'

/** Questions and answers in native <details> elements: keyboard and screen-reader friendly with no script. */
export default function Faq({
  eyebrow = copy.home.eyebrows.faq,
  title = copy.home.faq.title,
  items = copy.home.faq.items,
}) {
  return (
    <section className="mx-auto w-full max-w-3xl">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mb-6 text-title-2 md:text-title-1">{title}</h2>
      <div className="divide-y divide-separator overflow-hidden rounded-panel border border-separator bg-surface shadow-1">
        {items.map((item) => (
          <details key={item.q} className="group">
            <summary className="state-layer flex min-h-touch cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-headline [&::-webkit-details-marker]:hidden">
              {item.q}
              <ChevronDown
                size={20}
                className="shrink-0 text-label-2 transition-transform duration-standard group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <p className="px-5 pb-5 text-body text-label-2">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
