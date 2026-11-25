// The signed-in renter's own dashboard.
export const renterHome = {
  meta: { title: 'Your dashboard' },
  greeting: (name) => `Hello, ${name.split(' ')[0]}`,
  nextHire: 'Your next hire',
  open: 'See the booking',
  noHireTitle: 'Where to next?',
  noHireText: 'You have no hire coming up. See real cars from approved companies.',
  findCar: 'Find a car',
  actions: { cars: 'All cars', bookings: 'Bookings', settings: 'Settings' },
  recent: 'Your bookings',
  seeAll: 'See all',
}
