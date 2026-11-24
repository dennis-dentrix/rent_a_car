import { notFound } from 'next/navigation'
import Alert from '@/components/Alert'
import PostEditor from '@/components/PostEditor'
import { copy } from '@/copy/en'
import { requireAdmin } from '@/lib/admin'
import { apiGet } from '@/lib/api'

export const metadata = { title: copy.auth.adminPosts.meta.title }

// One guide, opened for writing: its text and every picture uploaded for it.
export default async function EditPostPage({ params }) {
  const { id } = await params
  const { token } = await requireAdmin()
  const { data, error } = await apiGet(`/admin/posts/${id}`, { token })
  if (error === 'NOT_FOUND') notFound()
  if (error) return <Alert tone="error" title={copy.classPage.errorTitle} />
  return <PostEditor initial={data} />
}
