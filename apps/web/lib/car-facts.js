import { copy } from '@/copy/en'

const text = copy.carFacts

// How each detail of a car reads. A detail that was not filled in is left out, never shown as a guess.
const READERS = {
  seats: text.seats,
  luggage_capacity: text.bags,
  transmission: (value) => text.transmission[value],
  fuel_type: (value) => text.fuel_type[value],
  drive_type: (value) => text.drive_type[value],
  engine_cc: text.engine,
  colour: (value) => value,
}

/** The details a car has, as { key, label, value } in a fixed order. */
export const carFactList = (car) =>
  Object.entries(READERS)
    .filter(([key]) => car[key] !== null && car[key] !== undefined && car[key] !== '')
    .map(([key, read]) => ({ key, label: text.labels[key], value: read(car[key]) }))

/** "Toyota Prado", or a plain word when neither make nor model is known. */
export const carName = (car, fallback) =>
  [car.make, car.model].filter(Boolean).join(' ') || fallback
