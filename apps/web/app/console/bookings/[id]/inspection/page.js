import Link from 'next/link'
import AdminPage from '@/components/AdminPage'
import Alert from '@/components/Alert'
import InspectionForm from '@/components/InspectionForm'
import { copy } from '@/copy/en'
import { loadForOperator } from '@/lib/console'

const text = copy.inspections

export const metadata = { title: text.title }

export default async function NewInspectionPage({ params, searchParams }) {
  const { id } = await params
  const type = (await searchParams).type === 'return' ? 'return' : 'pickup'
  const { data, error } = await loadForOperator(`/operator/bookings/${id}`)
  if (error) return <Alert tone="error" title={copy.admin.loadError} />
  return (
    <AdminPage
      eyebrow={data.reference}
      title={text.reportTitle[type]}
      subtitle={text.form.subtitle}
      isNarrow
    >
      <Link href={`/console/bookings/${id}`} className="w-max font-semibold text-primary">
        ← {copy.operatorConsole.bookings.detail}
      </Link>
      <InspectionForm bookingId={id} type={type} />
    </AdminPage>
  )
}
