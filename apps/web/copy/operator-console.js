// The rental company's console: what its pages say.
export const operatorConsole = {
  meta: { title: 'Console' },
  nav: {
    today: 'Today',
    bookings: 'Bookings',
    fleet: 'Fleet',
    owners: 'Owners',
    classes: 'Classes',
    rates: 'Daily rates',
    places: 'Places',
    services: 'Services',
    company: 'Company',
    more: 'More',
    groupRun: 'Run',
    groupFleet: 'Fleet',
    groupPricing: 'Pricing',
    groupSetup: 'Setup',
  },
  today: {
    eyebrow: 'Your company',
    pickups: 'Pickups today',
    returns: 'Returns today',
    onHire: 'On hire now',
    vehicles: 'Active cars',
    needsTitle: 'Needs you',
    allClear: 'Nothing is waiting for you.',
    unpriced: (n) =>
      `${n} ${n === 1 ? 'car has' : 'cars have'} no daily rate. Set a rate for ${n === 1 ? 'its' : 'their'} class.`,
    setUpTitle: 'Get ready to rent',
    setUpHint: 'A few steps, and renters can find your cars.',
    steps: {
      company: {
        title: 'Complete your company details',
        hint: 'Registration number, KRA PIN, address and phone.',
        href: '/console/company',
      },
      vehicle: {
        title: 'Add your first car',
        hint: 'Registration, class and home place.',
        href: '/console/fleet',
      },
      rate: {
        title: 'Set a daily rate',
        hint: 'The price per day for a class.',
        href: '/console/rates',
      },
      service: {
        title: 'Choose what you offer',
        hint: 'Self-drive, chauffeur, transfers, events.',
        href: '/console/services',
      },
    },
    recentTitle: 'Coming up',
    noPickups: 'No pickups today.',
    openStep: 'Open',
  },
  bookings: {
    title: 'Bookings',
    subtitle: 'Bookings on your cars, newest first. Carvo handles confirmation for now.',
    empty: 'No bookings yet. They appear here when a renter books one of your cars.',
    back: 'Bookings',
    detail: 'Booking',
  },
  resources: {
    vehicles: {
      title: 'Fleet',
      subtitle: 'Your cars. Retire a car to stop renting it out.',
    },
    'vehicle-owners': {
      title: 'Owners',
      subtitle: 'People and companies whose cars you manage. Contact details only.',
    },
    classes: {
      title: 'Classes',
      subtitle:
        'Pick from the classes Carvo lists, or add your own. Your own class is shown to renters once Carvo lists it.',
    },
    rates: {
      title: 'Daily rates',
      subtitle:
        'Your price per day for a class, from a date. Renters are priced from Carvo’s rates until booking requests are open.',
    },
    places: {
      title: 'Your own places',
      subtitle: 'Airstrips and pick-up places that are not on Carvo’s list. Only you see these.',
    },
    company: {
      title: 'Company',
      subtitle: 'The details Carvo and renters see. Status and plan are set by Carvo.',
      fields: {
        business_name: 'Company name',
        registration_number: 'Registration number',
        kra_pin: 'KRA PIN',
        address: 'Address',
        phone: 'Phone, with country code (+254…)',
        email: 'Email',
      },
    },
  },
  places: {
    title: 'Places',
    subtitle:
      'Where you pick up and drop off. Airports and airstrips are all served unless you switch one off.',
    airportsTitle: 'Airports and airstrips',
    airportsHint:
      'Every public airport and airstrip in Kenya (from the Kenya Airports Authority and the safari strips). Switch off the ones you do not serve.',
    served: 'We serve this place',
    failed: 'That did not save. Try again.',
    international: 'Airports',
    airstrips: 'Airstrips',
    ownTitle: 'Add your own',
  },
  services: {
    title: 'Services',
    subtitle: 'What you offer. Renters can filter by these.',
    saved: 'Saved.',
    failed: 'That did not save. Try again.',
  },
}
