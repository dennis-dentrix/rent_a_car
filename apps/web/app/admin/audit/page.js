import AdminPage from '@/components/AdminPage'
import Alert from '@/components/Alert'
import AdminAuditList from '@/components/AdminAuditList'
import AdminMoreLink from '@/components/AdminMoreLink'
import { copy } from '@/copy/en'
import { adminGet, requireAdmin } from '@/lib/admin'
import { nextPageHref } from '@/lib/admin-format'

const text = copy.admin.audit

export const metadata = { title: text.title }

export default async function AuditPage({ searchParams }) {
  const { cursor } = await searchParams
  const { token } = await requireAdmin()
  const { data, meta, error } = await adminGet('/admin/audit', token, { cursor })
  if (error) return <Alert tone="error" title={copy.admin.loadError} />
  const older = nextPageHref('/admin/audit', {}, meta?.next_cursor)
  return (
    <AdminPage title={text.title} subtitle={text.subtitle}>
      <AdminAuditList entries={data} />
      <AdminMoreLink href={older}>{text.more}</AdminMoreLink>
    </AdminPage>
  )
}
