import { absoluteUrl } from '@/lib/site'

// Search engines may crawl the public pages. Account, booking, staff, admin, and internal areas are
// closed to them; those pages also carry noindex of their own.
export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/account', '/book', '/quote', '/console', '/admin', '/auth', '/dev', '/api'],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
  }
}
