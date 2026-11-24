import { describe, expect, it } from 'vitest'
import { buildSearchUrl, emptySearch, hasSearchDate } from './search-url.js'

const search = (changes) => ({ ...emptySearch(), ...changes })
const queryOf = (url) => Object.fromEntries(new URL(url, 'https://x').searchParams)
const stay = (start, end) => ({ start, end, startTime: '09:00', endTime: '18:00' })

describe('buildSearchUrl for car hire', () => {
  it('sends the range with its times, place, and service', () => {
    const values = search({
      service: 'chauffeur_driven',
      pickup: 'jkia',
      stay: stay('2026-12-01', '2026-12-04'),
    })
    expect(queryOf(buildSearchUrl('car_hire', values))).toEqual({
      service: 'chauffeur_driven',
      pickup: 'jkia',
      start: '2026-12-01',
      end: '2026-12-04',
      startTime: '09:00',
      endTime: '18:00',
    })
  })

  it('treats a single day as a one-day range', () => {
    const url = buildSearchUrl('car_hire', search({ stay: stay('2026-12-01', null) }))
    expect(queryOf(url)).toMatchObject({ start: '2026-12-01', end: '2026-12-01' })
  })
})

describe('buildSearchUrl with chosen car types', () => {
  it('sends the car types as a comma list for every service, and none when none are chosen', () => {
    const pick = { types: ['suv', 'executive'], when: { date: '2026-12-05', time: '09:00' } }
    expect(queryOf(buildSearchUrl('events', search(pick)))).toMatchObject({
      types: 'suv,executive',
    })
    expect(queryOf(buildSearchUrl('transfers', search(pick)))).toMatchObject({
      types: 'suv,executive',
    })
    expect(queryOf(buildSearchUrl('car_hire', search()))).not.toHaveProperty('types')
  })
})

describe('buildSearchUrl with extra parameters', () => {
  it('carries a chosen car type into the search', () => {
    const url = buildSearchUrl('car_hire', search({ stay: stay('2026-12-01', '2026-12-03') }), {
      class: 'suv',
    })
    expect(queryOf(url)).toMatchObject({ class: 'suv', start: '2026-12-01', end: '2026-12-03' })
  })
})

describe('buildSearchUrl for transfers and events', () => {
  it('sends a transfer as one day, from its start time to the end of the day', () => {
    const values = search({
      service: 'airport_transfer',
      pickup: 'jkia',
      dropoff: 'Westlands',
      when: { date: '2026-12-05', time: '21:30' },
    })
    expect(queryOf(buildSearchUrl('transfers', values))).toMatchObject({
      dropoff: 'Westlands',
      passengers: '2',
      start: '2026-12-05',
      end: '2026-12-05',
      startTime: '21:30',
      endTime: '23:59',
    })
  })

  it('sends an event with its place and the number of cars', () => {
    const values = search({
      service: 'wedding_car',
      place: 'Karen',
      cars: '3',
      when: { date: '2026-12-12', time: '08:00' },
    })
    expect(queryOf(buildSearchUrl('events', values))).toMatchObject({
      service: 'wedding_car',
      place: 'Karen',
      cars: '3',
    })
  })
})

describe('hasSearchDate', () => {
  it('needs the range for car hire and the day for the other services', () => {
    expect(hasSearchDate('car_hire', emptySearch())).toBe(false)
    expect(
      hasSearchDate('transfers', search({ when: { date: '2026-12-05', time: '09:00' } })),
    ).toBe(true)
    expect(hasSearchDate('events', emptySearch())).toBe(false)
  })
})
