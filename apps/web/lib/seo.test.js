import { describe, expect, it } from 'vitest'
import { pageMetadata } from './seo.js'
import {
  breadcrumbJsonLd,
  faqJsonLd,
  articleJsonLd,
  organizationJsonLd,
  productJsonLd,
  serviceJsonLd,
} from './structured-data.js'

describe('pageMetadata', () => {
  const base = { title: 'Cars', description: 'Rates', path: '/cars' }

  it('gives a page one canonical address and matching social cards', () => {
    const meta = pageMetadata(base)
    expect(meta.alternates.canonical).toMatch(/\/cars$/)
    expect(meta.openGraph.url).toBe(meta.alternates.canonical)
    expect(meta.openGraph.title).toBe('Cars')
    expect(meta.twitter.card).toBe('summary_large_image')
    expect(meta.openGraph.images[0]).toMatchObject({ width: 1200, height: 630 })
    expect(meta.robots).toEqual({ index: true, follow: true })
  })

  it('keeps variations out of the index but lets links be followed', () => {
    expect(pageMetadata({ ...base, isIndexable: false }).robots).toEqual({
      index: false,
      follow: true,
    })
  })
})

describe('structured data', () => {
  it('builds FAQ markup from the same question and answer pairs', () => {
    const data = faqJsonLd([{ q: 'Can I cancel?', a: 'Yes.' }])
    expect(data['@type']).toBe('FAQPage')
    expect(data.mainEntity[0]).toEqual({
      '@type': 'Question',
      name: 'Can I cancel?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes.' },
    })
  })

  it('numbers breadcrumb steps from one and uses full addresses', () => {
    const data = breadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Cars', path: '/cars' },
    ])
    expect(data.itemListElement.map((step) => step.position)).toEqual([1, 2])
    expect(data.itemListElement[1].item).toMatch(/^https?:\/\/.+\/cars$/)
  })

  it('describes the organisation without inventing contact details', () => {
    const data = organizationJsonLd()
    expect(data['@type']).toBe('Organization')
    expect(data).not.toHaveProperty('telephone')
  })
})

describe('product and service markup', () => {
  it('describes a service with its own address and the area served', () => {
    const data = serviceJsonLd({
      name: 'Transfers',
      description: 'Airport pickups',
      path: '/transfers',
    })
    expect(data['@type']).toBe('Service')
    expect(data.url).toMatch(/\/transfers$/)
    expect(data.areaServed.name).toBe('Kenya')
  })

  it('prices a product per day, and leaves the offer out when there is no rate', () => {
    const base = { name: 'Sedan', description: 'A sedan', path: '/cars/sedan' }
    const priced = productJsonLd({ ...base, priceKes: 6500 })
    expect(priced.offers.priceSpecification).toMatchObject({ price: 6500, unitCode: 'DAY' })
    expect(priced).not.toHaveProperty('aggregateRating')
    expect(productJsonLd({ ...base, priceKes: null })).not.toHaveProperty('offers')
  })

  it('dates an article and credits the company, with the modified date defaulting to the published one', () => {
    const data = articleJsonLd({
      title: 'T',
      description: 'D',
      path: '/blog/t',
      published: '2026-11-23',
    })
    expect(data['@type']).toBe('Article')
    expect(data.dateModified).toBe('2026-11-23')
    expect(data.author['@type']).toBe('Organization')
    expect(data.mainEntityOfPage).toMatch(/\/blog\/t$/)
  })
})
