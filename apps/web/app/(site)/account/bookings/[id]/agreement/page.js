import BackLink from '@/components/BackLink'
import { notFound } from 'next/navigation'
import AgreementSignForm from '@/components/AgreementSignForm'
import Alert from '@/components/Alert'
import LargeTitle from '@/components/LargeTitle'
import { copy } from '@/copy/en'
import { apiGet } from '@/lib/api'
import { requireRole } from '@/lib/auth/session'

const text = copy.trip.agreement

export const metadata = { title: text.title, robots: { index: false, follow: false } }

function Clauses({ clauses }) {
  return (
    <ol className="flex flex-col gap-4">
      {clauses.map((clause) => (
        <li key={clause.number}>
          <h2 className="text-headline">
            {clause.number}. {clause.title}
          </h2>
          <p className="mt-1 text-reading text-label-2">{clause.text}</p>
        </li>
      ))}
    </ol>
  )
}

export default async function AgreementPage({ params }) {
  const { id } = await params
  const { token, profile } = await requireRole(null, `/account/bookings/${id}/agreement`)
  const path = `/bookings/${encodeURIComponent(id)}/agreement`
  const { data, error } = await apiGet(path, { token })
  if (error === 'NOT_FOUND') notFound()
  if (error) return <Alert tone="error" title={copy.admin.loadError} />
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <BackLink href={`/account/bookings/${id}`}>← {text.back}</BackLink>
      <LargeTitle subtitle={data.reference}>{text.title}</LargeTitle>
      <Clauses clauses={data.clauses} />
      {data.signature && <Alert tone="success" title={text.signed(data.signature.signed_name)} />}
      {data.can_sign && (
        <AgreementSignForm
          bookingId={id}
          fingerprint={data.terms_sha256}
          name={profile.full_name}
        />
      )}
    </div>
  )
}
