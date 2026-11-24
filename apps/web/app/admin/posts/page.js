import Link from 'next/link'
import { formatFullDate } from '@rent-a-car/shared'
import { createPostAction } from '@/app/admin/posts/actions'
import Alert from '@/components/Alert'
import AuthForm from '@/components/AuthForm'
import Badge from '@/components/Badge'
import Button from '@/components/Button'
import LargeTitle from '@/components/LargeTitle'
import { copy } from '@/copy/en'
import { apiGet } from '@/lib/api'
import { getCurrentUser } from '@/lib/auth/session'

const text = copy.auth.adminPosts

export const metadata = { title: text.meta.title }

const NEW_GUIDE_FIELDS = [{ name: 'title', label: text.newTitle }]

function PostRow({ post }) {
  const isLive = post.status === 'published'
  return (
    <li>
      <Link
        href={`/admin/posts/${post.id}`}
        className="state-layer flex min-h-touch flex-wrap items-center justify-between gap-2 rounded-card bg-bg-grouped px-4 py-3"
      >
        <span>
          <span className="block text-headline">{post.title}</span>
          <span className="block text-footnote text-label-2">
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
  const { token } = await getCurrentUser()
  const { data, meta, error } = await apiGet('/admin/posts', {
    query: { cursor },
    token,
  })
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <Link
        href="/admin"
        className="text-callout font-medium text-primary underline underline-offset-2"
      >
        {copy.auth.adminOperators.back}
      </Link>
      <LargeTitle subtitle={text.subtitle}>{text.title}</LargeTitle>
      <AuthForm action={createPostAction} fields={NEW_GUIDE_FIELDS} submitLabel={text.newSubmit} />
      {error && <Alert tone="error" title={copy.classPage.errorTitle} />}
      {data?.length === 0 && <p className="text-body text-label-2">{text.empty}</p>}
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
    </div>
  )
}
