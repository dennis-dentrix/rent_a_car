import { brand } from '@carvo/shared/brand'

// The public address of the site, for canonical links, the sitemap, and structured data. Set
// NEXT_PUBLIC_SITE_URL in each environment; localhost is only the development fallback.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(
  /\/$/,
  '',
)

export const SITE_NAME = brand.name

/** An absolute URL for a path on this site: absoluteUrl('/cars') */
export const absoluteUrl = (path = '/') => `${SITE_URL}${path}`
