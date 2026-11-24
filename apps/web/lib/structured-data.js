import { SITE_NAME, absoluteUrl } from '@/lib/site'
import { brand } from '@rent-a-car/shared/brand'

// schema.org markup (JSON-LD). Every value is something visible on the page or in the brand file; no
// ratings, review counts, prices, or phone numbers are invented.
const CONTEXT = 'https://schema.org'

export const organizationJsonLd = () => ({
  '@context': CONTEXT,
  '@type': 'Organization',
  name: SITE_NAME,
  legalName: brand.legalName,
  url: absoluteUrl('/'),
  logo: absoluteUrl('/icon'),
})

/** `items` are { q, a } pairs: the same ones the page shows, so the markup always matches the page. */
export const faqJsonLd = (items) => ({
  '@context': CONTEXT,
  '@type': 'FAQPage',
  mainEntity: items.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
})

/** `trail` is [{ name, path }] from the home page down to the current page. */
export const breadcrumbJsonLd = (trail) => ({
  '@context': CONTEXT,
  '@type': 'BreadcrumbList',
  itemListElement: trail.map((step, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: step.name,
    item: absoluteUrl(step.path),
  })),
})

/** A service the company offers, described with the text the page shows. `path` is its page's address. */
export const serviceJsonLd = ({ name, description, path }) => ({
  '@context': CONTEXT,
  '@type': 'Service',
  name,
  description,
  url: absoluteUrl(path),
  areaServed: { '@type': 'Country', name: 'Kenya' },
  provider: { '@type': 'Organization', name: SITE_NAME, url: absoluteUrl('/') },
})

/** A car type with its daily rate, as one offer priced per day. No rating or review count: none exist yet. */
export const productJsonLd = ({ name, description, path, priceKes }) => ({
  '@context': CONTEXT,
  '@type': 'Product',
  name,
  description,
  category: 'Car rental',
  url: absoluteUrl(path),
  ...(priceKes === null
    ? {}
    : {
        offers: {
          '@type': 'Offer',
          url: absoluteUrl(path),
          priceCurrency: 'KES',
          price: priceKes,
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            price: priceKes,
            priceCurrency: 'KES',
            unitCode: 'DAY',
          },
        },
      }),
})

/** An article, described with the text the page shows. The company is both author and publisher. */
export const articleJsonLd = ({ title, description, path, published, updated, imageUrl }) => ({
  '@context': CONTEXT,
  '@type': 'Article',
  headline: title,
  description,
  datePublished: published,
  dateModified: updated ?? published,
  mainEntityOfPage: absoluteUrl(path),
  image: imageUrl ?? absoluteUrl('/opengraph-image'),
  author: { '@type': 'Organization', name: SITE_NAME, url: absoluteUrl('/') },
  publisher: {
    '@type': 'Organization',
    name: SITE_NAME,
    logo: { '@type': 'ImageObject', url: absoluteUrl('/icon') },
  },
})
