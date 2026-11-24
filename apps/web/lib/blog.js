import { apiGet } from '@/lib/api'
import { mediaUrl } from '@/lib/media'

// Guides are written in the admin and read from the API. A new one shows within a minute.
const REVALIDATE = 60

/** Published guides as cards, newest first. Resolves to { data } or { error }. */
export const getPosts = () => apiGet('/posts', { revalidate: REVALIDATE })

/** One guide by its address. Resolves to { post }, { isMissing: true }, or { error }. */
export async function getPostBySlug(slug) {
  const result = await apiGet(`/posts/${encodeURIComponent(slug)}`, { revalidate: REVALIDATE })
  if (result.error === 'NOT_FOUND') return { isMissing: true }
  return result.error ? { error: result.error } : { post: result.data }
}

/** The other guides, newest first, for "more guides" links. */
export const otherPosts = (posts, post, limit = 3) =>
  posts.filter((other) => other.slug !== post.slug).slice(0, limit)

/** The public address of an uploaded image, or null when no media address is set (the page then shows no picture). */
export const postImageUrl = (image) =>
  image ? mediaUrl(image.storage_path, process.env.NEXT_PUBLIC_MEDIA_BASE_URL) : null
