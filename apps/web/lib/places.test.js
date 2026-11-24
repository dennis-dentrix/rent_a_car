import { describe, expect, it } from 'vitest'
import { matchKnownPlaces, mergePlaces, placeText } from './places.js'

const known = [
  { value: 'nairobi-office', label: 'Nairobi Office' },
  { value: 'nairobi', label: 'Nairobi' },
]

describe('places', () => {
  it('writes a suggestion as its name, then its area', () => {
    expect(placeText({ label: 'Westlands', detail: 'Nairobi' })).toBe('Westlands, Nairobi')
    expect(placeText({ label: 'Karen', detail: '' })).toBe('Karen')
  })

  it('matches our own places on any part of the name, ignoring case, and lists all when nothing is typed', () => {
    expect(matchKnownPlaces(known, 'OFFICE').map((place) => place.label)).toEqual([
      'Nairobi Office',
    ])
    expect(matchKnownPlaces(known, '')).toHaveLength(2)
  })

  it('puts our places first and drops a map suggestion with the same name', () => {
    const remote = [
      { id: 'a', label: 'nairobi', detail: 'Kenya' },
      { id: 'b', label: 'Westlands', detail: 'Nairobi' },
    ]
    const merged = mergePlaces(matchKnownPlaces(known, 'nai'), remote)
    expect(merged.map((place) => place.label)).toEqual(['Nairobi Office', 'Nairobi', 'Westlands'])
  })
})
