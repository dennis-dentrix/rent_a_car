import { ChevronDown } from 'lucide-react'
import SectionHeading from '@/components/SectionHeading'
import { copy } from '@/copy/en'

/** Questions and answers in native <details> elements: keyboard and screen-reader friendly with no script. */
export default function Faq({ title = copy.home.faq.title, items = copy.home.faq.items }) {
  return (
    <section className="w-full max-w-3xl">
      <SectionHeading title={title} />
      <div className="divide-y divide-separator border-y border-separator">
        {items.map((item) => (
          <details key={item.q} className="group">
            <summary className="flex min-h-touch cursor-pointer list-none items-center justify-between gap-4 py-4 text-headline [&::-webkit-details-marker]:hidden">
              {item.q}
              <ChevronDown
                size={20}
                className="shrink-0 text-label-2 transition-transform duration-standard group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <p className="pb-5 text-reading text-label-2">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
