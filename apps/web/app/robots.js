import { PRIVATE_AREAS } from '@/lib/private-areas'
import { absoluteUrl } from '@/lib/site'

// Search engines may crawl the public pages. Account, booking, staff, admin, and internal areas are
// closed to them; those pages also carry noindex of their own.
export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: PRIVATE_AREAS,
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
  }
}
