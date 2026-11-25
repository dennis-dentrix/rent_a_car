import RuledItem from '@/components/RuledItem'
import SectionHeading from '@/components/SectionHeading'
import TextLink from '@/components/TextLink'
import { withParams } from '@/lib/query'

/** The services a page covers, each with its own description and a link into the search. */
export default function ServiceList({ title, services }) {
  return (
    <section>
      <SectionHeading title={title} />
      <ul className="grid gap-8 md:grid-cols-2">
        {services.map((service) => (
          <li key={service.id}>
            <RuledItem title={service.title} text={service.text}>
              <span className="mt-2">
                <TextLink href={withParams('/cars', { service: service.id })}>
                  {service.action}
                </TextLink>
              </span>
            </RuledItem>
          </li>
        ))}
      </ul>
    </section>
  )
}
