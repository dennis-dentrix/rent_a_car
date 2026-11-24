import Link from 'next/link'
import { CarFront, PartyPopper, Plane } from 'lucide-react'
import { SERVICE_GROUPS } from '@carvo/shared'
import Button from '@/components/Button'
import Eyebrow from '@/components/Eyebrow'
import IconTile from '@/components/IconTile'
import Reveal from '@/components/Reveal'
import { copy } from '@/copy/en'
import { withParams } from '@/lib/query'

const GROUP_STYLE = {
  car_hire: { icon: CarFront, tone: 'blue' },
  transfers: { icon: Plane, tone: 'peach' },
  events: { icon: PartyPopper, tone: 'green' },
}

const serviceHref = (service) => withParams('/cars', { service })

function ServiceCard({ group, index }) {
  const { icon, tone } = GROUP_STYLE[group]
  const text = copy.services.groups[group]
  return (
    <Reveal delay={index * 60} className="h-full">
      <div className="flex h-full flex-col rounded-panel border border-separator bg-surface p-5 shadow-1 md:p-6">
        <IconTile icon={icon} tone={tone} className="mb-4" />
        <h3 className="text-title-2">{text.title}</h3>
        <p className="mt-2 text-callout text-label-2">{text.text}</p>
        <ul className="mt-4 flex flex-1 flex-wrap content-start gap-2">
          {SERVICE_GROUPS[group].map((service) => (
            <li key={service}>
              <Link
                href={serviceHref(service)}
                className="state-layer inline-flex min-h-compact items-center rounded-pill bg-accent-subtle px-4 text-callout font-medium text-primary"
              >
                {copy.services.items[service]}
              </Link>
            </li>
          ))}
        </ul>
        <Button href={copy.servicePages[group].path} variant="tonal" className="mt-5">
          {text.action}
        </Button>
      </div>
    </Reveal>
  )
}

/** The three service lines, each with its own services as one-tap links into the search. */
export default function ServicesSection() {
  const { title, text } = copy.home.servicesIntro
  return (
    <section>
      <Eyebrow>{copy.home.eyebrows.services}</Eyebrow>
      <h2 className="max-w-xl text-title-2 md:text-title-1">{title}</h2>
      <p className="mb-6 mt-2 max-w-xl text-body text-label-2">{text}</p>
      <ul className="grid gap-4 md:grid-cols-3 md:gap-6">
        {Object.keys(GROUP_STYLE).map((group, index) => (
          <li key={group}>
            <ServiceCard group={group} index={index} />
          </li>
        ))}
      </ul>
    </section>
  )
}
