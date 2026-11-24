import Link from 'next/link'
import { formatShortDate } from '@carvo/shared'
import AdminPage from '@/components/AdminPage'
import InsetList from '@/components/InsetList'
import ResourceForm from '@/components/ResourceForm'
import ResourceList from '@/components/ResourceList'
import { copy } from '@/copy/en'
import { registryFor } from '@/lib/resource-scopes'

const text = copy.adminFleet
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
      <h2 className="text-title-3">{text.vehicle.agreementsTitle}</h2>
      {vehicle.agreements.length ? (
        <InsetList items={agreementItems(vehicle.agreements)} />
      ) : (
        <p className="text-body text-label-2">{text.vehicle.noAgreements}</p>
      )}
      {vehicle.owner_id ? (
        <details className="rounded-card border border-separator p-4">
          <summary className="min-h-touch cursor-pointer list-none text-headline">
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
        <p className="text-callout text-label-2">{text.vehicle.needOwner}</p>
      )}
    </section>
  )
}

function Trackers({ vehicle, scope }) {
  const { fields, summarize } = registryFor(scope).trackers
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-title-3">{text.vehicle.trackersTitle}</h2>
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

/** One vehicle: its trackers and its owner agreements, with a link back to the fleet list. */
export default function VehicleDetail({ vehicle, scope, backHref }) {
  const name = [vehicle.make, vehicle.model].filter(Boolean).join(' ') || text.noMake
  return (
    <AdminPage
      title={`${name} · ${vehicle.registration}`}
      subtitle={vehicle.owner?.full_name ?? text.vehicle.ownerNone}
      isNarrow
    >
      <Link
        href={backHref}
        className="text-callout font-medium text-primary underline underline-offset-2"
      >
        {text.vehicle.back}
      </Link>
      <Trackers vehicle={vehicle} scope={scope} />
      <Agreements vehicle={vehicle} scope={scope} />
      <p className="text-footnote text-label-3">{text.vehicle.sensitive}</p>
    </AdminPage>
  )
}
