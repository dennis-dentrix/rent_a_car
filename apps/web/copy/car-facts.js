// The words that describe a car, shared by the company's console and the cars renters see.
export const carFacts = {
  labels: {
    seats: 'Seats',
    luggage_capacity: 'Luggage',
    transmission: 'Gearbox',
    fuel_type: 'Fuel',
    drive_type: 'Drive',
    engine_cc: 'Engine',
    colour: 'Colour',
  },
  seats: (n) => `${n} seats`,
  bags: (n) => `${n} ${n === 1 ? 'bag' : 'bags'}`,
  engine: (cc) => `${cc.toLocaleString('en-KE')} cc`,
  transmission: { automatic: 'Automatic', manual: 'Manual' },
  fuel_type: { petrol: 'Petrol', diesel: 'Diesel', hybrid: 'Hybrid', electric: 'Electric' },
  drive_type: { two_wheel: '2WD', four_wheel: '4WD', all_wheel: 'AWD' },
  chauffeur: {
    self_drive: 'Self-drive',
    chauffeur: 'With a chauffeur',
    both: 'Self-drive or chauffeur',
  },
}
