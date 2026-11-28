import { describe, expect, it } from 'vitest'
import {
  carPath,
  filterCars,
  sortCars,
  toggledTypes,
  withCarPhotos,
  listedTypes,
  shownTypes,
} from './live-cars.js'

const cars = [
  { id: 1, transmission: 'automatic', class: { slug: 'suv' } },
  { id: 2, transmission: 'manual', class: null },
]

describe('choosing among the cars', () => {
  it('shows every car until something is chosen', () => {
    expect(filterCars(cars, {})).toEqual(cars)
  })

  it('narrows by type and gearbox together', () => {
    expect(filterCars(cars, { type: 'suv', gear: 'automatic' })).toEqual([cars[0]])
    expect(filterCars(cars, { type: 'suv', gear: 'manual' })).toEqual([])
  })
})

describe('searching among the cars', () => {
  const found = [
    {
      id: 1,
      make: 'Toyota',
      model: 'Prado',
      chauffeur_option: 'chauffeur',
      class: { slug: 'suv' },
    },
    { id: 2, make: 'Honda', model: 'Fit', chauffeur_option: null, class: { slug: 'compact' } },
  ]

  it('narrows to the chosen types, words, and kind of driver', () => {
    expect(filterCars(found, { types: 'compact,van' })).toEqual([found[1]])
    expect(filterCars(found, { q: 'prado' })).toEqual([found[0]])
    expect(filterCars(found, { service: 'self_drive' })).toEqual([found[1]])
    expect(filterCars(found, { service: 'chauffeur_driven' })).toEqual([found[0]])
  })
})

describe('a car type\u2019s picture', () => {
  const photographed = { id: 3, class: { slug: 'suv' }, photo_paths: ['vehicles/3/a.jpg'] }

  it('keeps its own, and otherwise borrows a real car\u2019s cover', () => {
    const classes = [
      { slug: 'suv', image_url: null },
      { slug: 'van', image_url: null },
    ]
    expect(withCarPhotos(classes, [photographed]).map((item) => item.image_url)).toEqual([
      'vehicles/3/a.jpg',
      null,
    ])
    expect(
      withCarPhotos([{ slug: 'suv', image_url: 'own.jpg' }], [photographed])[0].image_url,
    ).toBe('own.jpg')
  })

  it('gives a car a page only when its type has one', () => {
    expect(carPath(photographed)).toBe('/cars/suv/3')
    expect(carPath({ id: 4, class: null })).toBeNull()
  })
})

describe('the order of results', () => {
  const found = [
    { id: 1, created_at: '2027-01-03' },
    { id: 2, daily_rate_kes: 9000, created_at: '2027-01-01' },
    { id: 3, total_kes: 6000, created_at: '2027-01-02' },
  ]
  const order = (sort) => sortCars(found, sort).map((car) => car.id)

  it('is lowest price first unless asked otherwise, with unpriced cars last', () => {
    expect(order()).toEqual([3, 2, 1])
    expect(order('price_high')).toEqual([2, 3, 1])
    expect(order('newest')).toEqual([1, 3, 2])
  })
})

describe('the price and type filters', () => {
  const cars = [
    { id: 1, daily_rate_kes: 4000, class: { slug: 'compact' } },
    { id: 2, daily_rate_kes: 20000, class: { slug: 'suv' } },
  ]

  it('keeps cars up to the highest daily price chosen', () => {
    expect(filterCars(cars, { max: '5000' })).toEqual([cars[0]])
  })

  it('adds a car type to the choice, or takes it away', () => {
    expect(toggledTypes('suv', 'compact')).toBe('suv,compact')
    expect(toggledTypes('suv,compact', 'suv')).toBe('compact')
    expect(toggledTypes(undefined, 'van')).toBe('van')
  })
})

describe('car types shown to renters', () => {
  it('are those with a car listed, so none is offered that cannot be hired', () => {
    const types = [
      { slug: 'compact', price_per_day_kes: null },
      { slug: 'economy', price_per_day_kes: 3500 },
    ]
    expect(listedTypes(types)).toEqual([types[1]])
    expect(listedTypes(undefined)).toEqual([])
  })

  it('are pictured by a real car of the type', () => {
    const types = [{ slug: 'suv', price_per_day_kes: 9000 }]
    const cars = [{ class: { slug: 'suv' }, photo_paths: ['vehicles/a/front.jpg'] }]
    expect(shownTypes(types, cars)[0].image_url).toBe('vehicles/a/front.jpg')
    expect(shownTypes(types, undefined)[0].image_url).toBeNull()
  })
})
