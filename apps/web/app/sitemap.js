import { getClasses } from '@/lib/catalogue'
import { getPosts } from '@/lib/blog'
import { absoluteUrl } from '@/lib/site'

// Public, indexable pages: the fixed ones, and one page for every car type, read from the API. City, airport,
// and office pages are added here as they are built (docs/growth-seo.md section 2). Account, booking, staff,
// and admin pages never appear. If the API does not answer, the fixed pages are still listed.
// Rebuilt at most every five minutes, so a guide published today is listed today, without a deployment.
export const revalidate = 300

export default async function sitemap() {
  const [classes, posts] = await Promise.all([getClasses(), getPosts()])
  const carTypes = (classes.data ?? []).map((item) => ({
    url: absoluteUrl(`/cars/${item.slug}`),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))
  return [
    { url: absoluteUrl('/'), changeFrequency: 'weekly', priority: 1 },
    { url: absoluteUrl('/car-hire'), changeFrequency: 'weekly', priority: 0.9 },
    { url: absoluteUrl('/transfers'), changeFrequency: 'weekly', priority: 0.9 },
    { url: absoluteUrl('/events'), changeFrequency: 'weekly', priority: 0.9 },
    { url: absoluteUrl('/cars'), changeFrequency: 'daily', priority: 0.9 },
    { url: absoluteUrl('/operators'), changeFrequency: 'monthly', priority: 0.7 },
    { url: absoluteUrl('/blog'), changeFrequency: 'weekly', priority: 0.7 },
    { url: absoluteUrl('/privacy'), changeFrequency: 'yearly', priority: 0.3 },
    ...(posts.data ?? []).map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: post.updated_at,
      changeFrequency: 'monthly',
      priority: 0.8,
    })),
    ...carTypes,
  ]
}
