import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { SERVICE_GROUP_IDS } from '@carvo/shared'
import ServicesSection from '@/components/ServicesSection'
import { copy } from '@/copy/en'

const html = (component) => renderToStaticMarkup(createElement(component))

// The services copy also holds words shared by the three pages, which are not service lines.
describe('home services', () => {
  it('offers one way into each service line and nothing else', () => {
    const links = [...html(ServicesSection).matchAll(/href="([^"]+)"/g)].map(([, href]) => href)
    expect(links).toEqual(SERVICE_GROUP_IDS.map((group) => copy.servicePages[group].path))
  })
})
