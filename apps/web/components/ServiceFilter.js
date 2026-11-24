import { SERVICE_GROUPS, groupOfService } from '@rent-a-car/shared'
import Chip from '@/components/Chip'
import { copy } from '@/copy/en'
import { withParams } from '@/lib/query'

/**
 * Chips for the services in the chosen line, as links so the filter is part of the address. The API
 * narrows the list to car types whose rental company offers the service.
 */
export default function ServiceFilter({ params }) {
  const group = groupOfService(params.service) ?? 'car_hire'
  const href = (service) => withParams('/cars', { ...params, service, class: '' })
  return (
    <div className="mb-5 flex flex-col gap-3">
      <ul className="flex flex-wrap gap-2" aria-label={copy.services.filterLabel}>
        <li>
          <Chip label={copy.services.anyService} isSelected={!params.service} href={href('')} />
        </li>
        {SERVICE_GROUPS[group].map((service) => (
          <li key={service}>
            <Chip
              label={copy.services.items[service]}
              isSelected={params.service === service}
              href={href(service)}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
