// The company's classes and what it charges for each.
export const classPrices = {
  title: 'Classes and prices',
  subtitle:
    'Set your price per day for any class, or add your own class. Renters pay Carvo’s rate until booking requests open.',
  add: 'Add a class',
  editClass: (name) => `Change ${name}`,
  priceLabel: (name) => `Daily price of ${name}`,
  placeholder: 'KES per day',
  yours: 'Your price per day',
  unset: 'You have not set a price',
  renterPays: (price) => `Renters pay ${price} a day today`,
  noRenterPrice: 'Renters see “price on request”',
  carvoClass: 'Carvo class',
  listed: 'Yours, listed',
  waiting: 'Yours, waiting for Carvo to list it',
  newPrice: 'Price per day (KES)',
  history: 'Future prices and history',
  historyHint: 'Plan a price from a later date, end one, or look back at earlier ones.',
}
