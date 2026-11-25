import Alert from '@/components/Alert'
import InspectionReport from '@/components/InspectionReport'
import { copy } from '@/copy/en'
import { loadForOperator } from '@/lib/console'

const text = copy.inspections

export const metadata = { title: text.title }

export default async function ConsoleInspectionPage({ params }) {
  const { id } = await params
  const { data, error } = await loadForOperator(`/operator/inspections/${id}`)
  if (error) return <Alert tone="error" title={copy.admin.loadError} />
  return (
    <InspectionReport
      report={data}
      side="console"
      backHref="/console/inspections"
      backLabel={text.back}
    />
  )
}
