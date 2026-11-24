import {
  Briefcase,
  Building2,
  CarFront,
  Clapperboard,
  Heart,
  Plane,
  Route,
  UserRound,
} from 'lucide-react'
import Button from '@/components/Button'
import Eyebrow from '@/components/Eyebrow'
import IconTile from '@/components/IconTile'
import Reveal from '@/components/Reveal'
import { withParams } from '@/lib/query'

const SERVICE_ICONS = {
  self_drive: { icon: CarFront, tone: 'blue' },
  chauffeur_driven: { icon: UserRound, tone: 'peach' },
  airport_transfer: { icon: Plane, tone: 'blue' },
  corporate_transfer: { icon: Briefcase, tone: 'green' },
  wedding_car: { icon: Heart, tone: 'peach' },
  video_shoot: { icon: Clapperboard, tone: 'blue' },
  convoy: { icon: Route, tone: 'green' },
  corporate_transport: { icon: Building2, tone: 'peach' },
}

function ServiceCard({ service, index }) {
  return (
    <Reveal delay={(index % 2) * 60} className="h-full">
      <div className="flex h-full flex-col rounded-panel border border-separator bg-surface p-5 shadow-1 md:p-6">
        <IconTile {...SERVICE_ICONS[service.id]} className="mb-4" />
        <h3 className="text-title-2">{service.title}</h3>
        <p className="mt-2 flex-1 text-callout text-label-2">{service.text}</p>
        <Button
          href={withParams('/cars', { service: service.id })}
          variant="tonal"
          className="mt-5 self-start"
        >
          {service.action}
        </Button>
      </div>
    </Reveal>
  )
}

/** The services a page covers, each its own card with its own description and a link into the search. */
export default function ServiceList({ eyebrow, title, services }) {
  return (
    <section>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mb-6 text-title-2 md:text-title-1">{title}</h2>
      <ul className="grid gap-4 md:grid-cols-2 md:gap-6">
        {services.map((service, index) => (
          <li key={service.id}>
            <ServiceCard service={service} index={index} />
          </li>
        ))}
      </ul>
    </section>
  )
}
