import ResourceScreen from '@/components/ResourceScreen'
import { copy } from '@/copy/en'
import { requireOperator } from '@/lib/console'

const labels = copy.policies.page

export const metadata = { title: labels.title }

export default async function ConsolePoliciesPage({ searchParams }) {
  const { cursor } = await searchParams
  const { token } = await requireOperator()
  return (
    <ResourceScreen
      scope="console"
      resource="policies"
      labels={labels}
      token={token}
      cursor={cursor}
      basePath="/console/policies"
    />
  )
}
