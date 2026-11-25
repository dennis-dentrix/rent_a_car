import Image from 'next/image'
import { orderedChecks } from '@carvo/shared'
import Fact from '@/components/Fact'
import Panel from '@/components/Panel'
import StatusPill from '@/components/StatusPill'
import { copy } from '@/copy/en'
import { momentText } from '@/lib/admin-format'
import { carName } from '@/lib/car-facts'
import { policyLines } from '@/lib/policy-text'

const text = copy.inspections

function Readings({ report }) {
  const car = carName(report.vehicle, '')
  return (
    <Panel title={text.report.readings}>
      <dl className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <Fact label={text.report.car} value={`${car} ${report.vehicle.registration}`.trim()} />
        <Fact label={text.report.renter} value={report.renter.full_name} />
        <Fact label={text.report.company} value={report.company?.business_name ?? '—'} />
        <Fact label={text.report.recorded} value={momentText(report.recorded_at)} />
        <Fact label={text.form.mileage} value={report.mileage_km.toLocaleString('en-KE')} />
        <Fact label={text.form.fuel} value={text.fuel[report.fuel_level]} />
      </dl>
    </Panel>
  )
}

function Condition({ report }) {
  const note = report.damage_noted ? text.report.damaged : text.report.undamaged
  return (
    <Panel title={text.report.condition} hint={note}>
      <ul className="grid gap-x-8 gap-y-2 md:grid-cols-2">
        {orderedChecks(report.checklist).map(([check, result]) => (
          <li key={check} className="flex items-center justify-between gap-3">
            <span>{text.checks[check] ?? check}</span>
            <StatusPill tone={result === 'ok' ? 'success' : 'error'}>
              {result === 'ok' ? text.form.ok : text.form.issue}
            </StatusPill>
          </li>
        ))}
      </ul>
      {report.condition_notes && <p className="mt-4">{report.condition_notes}</p>}
    </Panel>
  )
}

// The links are signed and last ten minutes, so the pictures are shown as they are, without the image optimiser.
function Photos({ files }) {
  return (
    <Panel title={text.report.photos}>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {files.map((file, index) => (
          <li key={file.id}>
            <a href={file.url} target="_blank" rel="noreferrer">
              <span className="relative block aspect-[4/3] overflow-hidden rounded-card bg-fill">
                <Image
                  src={file.url}
                  alt={file.label ?? text.report.photo(index + 1)}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </span>
            </a>
          </li>
        ))}
      </ul>
    </Panel>
  )
}

function Rules({ policy }) {
  const lines = policy ? policyLines(policy) : []
  if (!lines.length) return null
  return (
    <Panel title={text.report.rules}>
      <ul className="list-disc pl-5">
        {lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </Panel>
  )
}

/** What was inspected: the readings, the checks, the photos, and the company's rules. */
export default function ReportBody({ report }) {
  return (
    <>
      <Readings report={report} />
      <Condition report={report} />
      <Photos files={report.files.filter((file) => file.content_type.startsWith('image/'))} />
      <Rules policy={report.policy} />
    </>
  )
}
