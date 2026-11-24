import { notFound } from 'next/navigation'
import ResourceScreen from '@/components/ResourceScreen'
import { copy } from '@/copy/en'
import { requireAdmin } from '@/lib/admin'
import { RESOURCES } from '@/lib/admin-resources'

const text = copy.adminSetup

const resourceCopy = (resource) => text.resources[resource] ?? copy.adminFleet.resources[resource]

export async function generateMetadata({ params }) {
  const { resource } = await params
  return { title: resourceCopy(resource)?.title }
}

export default async function ResourcePage({ params, searchParams }) {
  const { resource } = await params
  const { cursor } = await searchParams
  const definition = RESOURCES[resource]
  if (!definition || definition.isNested) notFound()
  const { token } = await requireAdmin()
  return (
    <ResourceScreen
      scope="admin"
      resource={resource}
      labels={resourceCopy(resource)}
      token={token}
      cursor={cursor}
      basePath={`/admin/setup/${resource}`}
    />
  )
}
