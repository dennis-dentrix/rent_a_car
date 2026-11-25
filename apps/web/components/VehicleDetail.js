import Link from 'next/link'
import { formatShortDate } from '@carvo/shared'
import AdminPage from '@/components/AdminPage'
import EditRecord from '@/components/EditRecord'
import VehicleFacts from '@/components/VehicleFacts'
import InsetList from '@/components/InsetList'
import ResourceForm from '@/components/ResourceForm'
import ResourceList from '@/components/ResourceList'
import VehiclePhotos from '@/components/VehiclePhotos'
import { copy } from '@/copy/en'
import { carName } from '@/lib/car-facts'
import { mediaUrl } from '@/lib/media'
import { registryFor } from '@/lib/resource-scopes'

const text = copy.adminFleet

// A photo whose address cannot be built (no media address set) is left out rather than shown broken.
const toPhotos = (paths = []) =>
  paths
    .map((path) => ({ path, url: mediaUrl(path, process.env.NEXT_PUBLIC_MEDIA_BASE_URL) }))
    .filter((photo) => photo.url)
const labels = (key) => text.resources[key].fields

const agreementItems = (agreements) =>
  agreements.map((agreement) => ({
    id: agreement.id,
    title: text.vehicle.agreementLine(
      agreement.commission_percent,
      formatShortDate(agreement.starts_on),
      agreement.ends_on ? formatShortDate(agreement.ends_on) : '…',
    ),
  }))

function Agreements({ vehicle, scope }) {
  const { fields } = registryFor(scope).agreements
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-section">{text.vehicle.agreementsTitle}</h2>
      {vehicle.agreements.length ? (
        <InsetList items={agreementItems(vehicle.agreements)} />
      ) : (
        <p className="text-cell text-label-2">{text.vehicle.noAgreements}</p>
      )}
      {vehicle.owner_id ? (
        <details className="rounded-card border border-separator p-4">
          <summary className="min-h-touch cursor-pointer list-none text-section">
            {text.vehicle.addAgreement}
          </summary>
          <ResourceForm
            resource="agreements"
            scope={scope}
            fields={fields}
            labels={labels('agreements')}
            refs={{}}
            parent={vehicle.owner_id}
            fixed={{ vehicle_id: vehicle.id }}
          />
        </details>
      ) : (
        <p className="text-cell text-label-2">{text.vehicle.needOwner}</p>
      )}
    </section>
  )
}

function Trackers({ vehicle, scope }) {
  const { fields, summarize } = registryFor(scope).trackers
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-section">{text.vehicle.trackersTitle}</h2>
      <ResourceList
        rows={vehicle.trackers}
        summarize={summarize}
        formProps={{
          resource: 'trackers',
          scope,
          fields,
          labels: labels('trackers'),
          refs: {},
          parent: vehicle.id,
        }}
      />
    </section>
  )
}

/**
 * One car: everything about it with an edit drawer, its photos, trackers and owner agreements. `refs` are the choices
 * the edit form offers.
 */
export default function VehicleDetail({ vehicle, scope, backHref, refs }) {
  const { fields } = registryFor(scope).vehicles
  const name = carName(vehicle, text.noMake)
  const car = { scope, vehicleId: vehicle.id }
  const edit = (
    <EditRecord
      label={text.vehicle.edit}
      title={name}
      row={vehicle}
      formProps={{
        resource: 'vehicles',
        scope,
        fields,
        labels: labels('vehicles'),
        refs,
        parent: vehicle.id,
      }}
    />
  )
  return (
    <AdminPage
      eyebrow={vehicle.registration}
      title={[name, vehicle.year].filter(Boolean).join(' ')}
      subtitle={text.statuses[vehicle.status]}
      actions={edit}
    >
      <Link href={backHref} className="w-max text-cell font-semibold text-primary">
        ← {text.vehicle.back}
      </Link>
      <VehiclePhotos car={car} photos={toPhotos(vehicle.photo_paths)} />
      <VehicleFacts vehicle={vehicle} car={car} fallback={refs.classRates?.[vehicle.class_id]} />
      <Trackers vehicle={vehicle} scope={scope} />
      <Agreements vehicle={vehicle} scope={scope} />
      <p className="text-footnote text-label-3">{text.vehicle.sensitive}</p>
    </AdminPage>
  )
}
