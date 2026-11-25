import Link from 'next/link'
import { formatFullDate } from '@carvo/shared'
import { createPostAction } from '@/app/admin/posts/actions'
import Alert from '@/components/Alert'
import AuthForm from '@/components/AuthForm'
import Badge from '@/components/Badge'
import Button from '@/components/Button'
import AdminPage from '@/components/AdminPage'
import { copy } from '@/copy/en'
import { requireAdmin } from '@/lib/admin'
import { apiGet } from '@/lib/api'

const text = copy.auth.adminPosts

export const metadata = { title: text.meta.title }

const NEW_GUIDE_FIELDS = [{ name: 'title', label: text.newTitle }]

function PostRow({ post }) {
  const isLive = post.status === 'published'
  return (
    <li>
      <Link
        href={`/admin/posts/${post.id}`}
        className="state-layer flex min-h-touch flex-wrap items-center justify-between gap-2 rounded-panel border border-separator bg-surface px-5 py-3 shadow-1"
      >
        <span>
          <span className="block text-section">{post.title}</span>
          <span className="block text-meta text-label-2">
            /blog/{post.slug} · {text.updated(formatFullDate(post.updated_at))}
          </span>
        </span>
        <Badge tone={isLive ? 'success' : 'neutral'}>{isLive ? text.published : text.draft}</Badge>
      </Link>
    </li>
  )
}

// Every guide, newest first, drafts included. A new one is started with just a title.
export default async function PostsPage({ searchParams }) {
  const { cursor } = await searchParams
  const { token } = await requireAdmin()
  const { data, meta, error } = await apiGet('/admin/posts', {
    query: { cursor },
    token,
  })
  return (
    <AdminPage title={text.title} subtitle={text.subtitle} isNarrow>
      <AuthForm action={createPostAction} fields={NEW_GUIDE_FIELDS} submitLabel={text.newSubmit} />
      {error && <Alert tone="error" title={copy.classPage.errorTitle} />}
      {data?.length === 0 && <p className="text-cell text-label-2">{text.empty}</p>}
      <ul className="flex flex-col gap-2">
        {(data ?? []).map((post) => (
          <PostRow key={post.id} post={post} />
        ))}
      </ul>
      {meta?.next_cursor && (
        <Button
          href={`/admin/posts?cursor=${encodeURIComponent(meta.next_cursor)}`}
          variant="tonal"
        >
          {text.next}
        </Button>
      )}
    </AdminPage>
  )
}
