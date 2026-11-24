import { describe, expect, it } from 'vitest'
import { privacy } from './privacy.js'

describe('privacy policy copy', () => {
  it('gives every section its own anchor, a heading, and text, so the contents list works', () => {
    const ids = privacy.sections.map((section) => section.id)
    expect(new Set(ids).size).toBe(ids.length)
    privacy.sections.forEach((section) => {
      expect(section.id).toMatch(/^[a-z]+(-[a-z]+)*$/)
      expect(section.heading.trim()).not.toBe('')
      expect(section.paragraphs.length).toBeGreaterThan(0)
    })
  })

  it('lives at the address the cookie notice and the footer link to', () => {
    expect(privacy.path).toBe('/privacy')
  })
})
