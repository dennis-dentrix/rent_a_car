import { SERVICE_GROUP_IDS } from '@carvo/shared'
import Button from '@/components/Button'
import RuledItem from '@/components/RuledItem'
import SectionHeading from '@/components/SectionHeading'
import { copy } from '@/copy/en'

function ServiceGroup({ group }) {
  const item = copy.services.groups[group]
  return (
    <RuledItem title={item.title} text={item.text}>
      <div className="mt-auto pt-4">
        <Button href={copy.servicePages[group].path} variant="tonal">
          {item.action}
        </Button>
      </div>
    </RuledItem>
  )
}

/** The three service lines, one way into each: its own page lists what it covers. */
export default function ServicesSection() {
  const { title, text } = copy.home.servicesIntro
  return (
    <section>
      <SectionHeading title={title}>{text}</SectionHeading>
      <ul className="grid gap-8 md:grid-cols-3">
        {SERVICE_GROUP_IDS.map((group) => (
          <li key={group}>
            <ServiceGroup group={group} />
          </li>
        ))}
      </ul>
    </section>
  )
}
