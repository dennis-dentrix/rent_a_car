import ResourceScreen from '@/components/ResourceScreen'
import { copy } from '@/copy/en'
import { requireOperator } from '@/lib/console'

const labels = {
  ...copy.operatorConsole.resources.classes,
  fields: copy.adminSetup.resources.classes.fields,
}

export const metadata = { title: labels.title }

export default async function ConsoleClassesPage({ searchParams }) {
  const { cursor } = await searchParams
  const { token } = await requireOperator()
  return (
    <ResourceScreen
      scope="console"
      resource="classes"
      labels={labels}
      token={token}
      cursor={cursor}
      basePath="/console/classes"
    />
  )
}
