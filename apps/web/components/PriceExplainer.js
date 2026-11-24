import { BadgeCheck, Percent, Truck, Wallet } from 'lucide-react'
import Band from '@/components/Band'
import Eyebrow from '@/components/Eyebrow'
import IconTile from '@/components/IconTile'
import Reveal from '@/components/Reveal'
import { copy } from '@/copy/en'

const LINE_ICONS = [
  { icon: BadgeCheck, tone: 'blue' },
  { icon: Percent, tone: 'green' },
  { icon: Truck, tone: 'peach' },
  { icon: Wallet, tone: 'blue' },
]

/** What goes into a price, as the four lines of a quote, so nothing about the cost is a surprise. */
export default function PriceExplainer() {
  const { title, intro, lines } = copy.home.price
  return (
    <Band>
      <div className="grid gap-8 md:grid-cols-[1fr_1.4fr] md:gap-12">
        <div>
          <Eyebrow>{copy.home.eyebrows.price}</Eyebrow>
          <h2 className="text-title-2 md:text-title-1">{title}</h2>
          <p className="mt-3 text-body text-label-2">{intro}</p>
        </div>
        <ol className="flex flex-col gap-3">
          {lines.map((line, index) => (
            <li key={line.title}>
              <Reveal delay={index * 50}>
                <div className="flex items-start gap-4 rounded-card border border-separator bg-surface p-4 shadow-1">
                  <IconTile {...LINE_ICONS[index]} />
                  <div>
                    <h3 className="text-headline">{line.title}</h3>
                    <p className="mt-0.5 text-callout text-label-2">{line.text}</p>
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </Band>
  )
}
