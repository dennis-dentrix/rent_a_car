import { describe, expect, it } from 'vitest'
import { buildSuggestions, filterSuggestions, textSearchHref } from './suggestions.js'

const items = buildSuggestions({
  classes: [
    { name: 'Family SUV', slug: 'suv', best_for: ['Families', 'Upcountry'] },
    { name: 'Economy', slug: 'economy', best_for: ['City trips'] },
  ],
  locations: [{ name: 'JKIA Airport', slug: 'jkia' }],
})

describe('suggestions', () => {
  it('lists every service, car type, and place with the address it leads to', () => {
    expect(items.filter((item) => item.kind === 'service')).toHaveLength(8)
    expect(items.find((item) => item.label === 'Family SUV').href).toBe('/cars/suv')
    expect(items.find((item) => item.label === 'JKIA Airport').href).toBe('/cars?pickup=jkia')
  })

  it('matches typed text on the label or what a car is best for, ignoring case', () => {
    expect(filterSuggestions(items, 'fam').map((item) => item.label)).toEqual(['Family SUV'])
    expect(filterSuggestions(items, 'CITY').map((item) => item.label)).toEqual(['Economy'])
  })

  it('puts labels that start with the text first, and shows nothing for empty text', () => {
    const labels = filterSuggestions(items, 'air').map((item) => item.label)
    expect(labels[0]).toBe('Airport transfer')
    expect(labels).toContain('JKIA Airport')
    expect(filterSuggestions(items, '   ')).toEqual([])
  })

  it('turns free text into a name search', () => {
    expect(textSearchHref(' Prado ')).toBe('/cars?q=Prado')
  })
})
