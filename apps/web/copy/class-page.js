// The car type page. Every line is either data from the API (name, seats, description, rate) or a statement
// that follows a ruling: nothing here promises a price, a rating, or a feature that does not exist.
export const classPage = {
  eyebrow: 'Car type',
  crumbsLabel: 'Breadcrumb',
  home: 'Home',
  notFound: 'Car type not found',
  meta: {
    title: (name) => `${name} hire in Kenya`,
    description: (name, seats, rate) =>
      `Hire a ${name} in Kenya. Seats ${seats}${rate ? `, from ${rate} a day` : ''}. The full price is shown before you ask.`,
  },
  facts: { seats: 'Seats', luggage: 'Luggage', bestFor: 'Best for' },
  from: 'From',
  perDay: 'per day',
  deposit: 'No deposit is taken when you book.',
  datesTitle: 'Check these dates',
  check: 'See availability',
  sticky: 'Check dates',
  ask: 'Ask about this car',
  askMessage: (name) => `Hello, I would like to ask about the ${name}.`,
  similarEyebrow: 'More to consider',
  similarTitle: 'Other car types',
  errorTitle: 'We could not load this car type',
  errorText: 'Check your connection and try again.',
  retry: 'Try again',
}
