import { describe, expect, it } from 'vitest'
import { carPath, filterCars, withCarPhotos } from './live-cars.js'

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
