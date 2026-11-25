import { describe, expect, it } from 'vitest'
import { carFactList, carName } from './car-facts.js'

describe('the details of a car', () => {
  it('reads only what was filled in, in a fixed order', () => {
    const car = {
      transmission: 'automatic',
      seats: 7,
      colour: '',
      engine_cc: null,
      luggage_capacity: 0,
    }
    expect(carFactList(car).map((fact) => fact.value)).toEqual(['7 seats', '0 bags', 'Automatic'])
  })

  it('names a car by make and model, or by the word given', () => {
    expect(carName({ make: 'Toyota', model: 'Prado' }, 'Car')).toBe('Toyota Prado')
    expect(carName({}, 'Car')).toBe('Car')
  })
})
