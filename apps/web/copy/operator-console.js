// The rental company's console: what its pages say.
export const operatorConsole = {
  meta: { title: 'Console' },
  handover: {
    title: 'Drop-off and pick-up',
    offers_dropoff: {
      label: 'We drop cars off',
      hint: 'Renters can ask you to bring the car to their pick up location.',
    },
    offers_pickup: {
      label: 'We pick cars up',
      hint: 'Renters can ask you to collect the car when the hire ends.',
    },
    failed: 'That did not save. Try again.',
  },
  nav: {
    today: 'Today',
    bookings: 'Bookings',
    fleet: 'Fleet',
    owners: 'Owners',
    places: 'Places',
    services: 'Services',
    company: 'Company',
    more: 'More',
    groupRun: 'Operations',
    groupFleet: 'Cars and prices',
    groupSetup: 'Your business',
  },
  today: {
    eyebrow: 'Operations today',
    subtitle: 'Your cars, today’s handovers, and what is still needed before renters can book.',
    ready: 'Ready to rent',
    readyDone: 'Setup complete',
    readyLeft: (n) => `${n} ${n === 1 ? 'step' : 'steps'} to go`,
    done: 'Done',
    dueToday: 'Due today',
    ofFleet: (n) => `of ${n} in your fleet`,
    ofActive: (n) => `of ${n} active`,
    unpricedShort: (n) => `${n} without a daily price`,
    pickups: 'Pickups today',
    returns: 'Returns today',
    onHire: 'On hire now',
    vehicles: 'Active cars',
    needsTitle: 'Needs you',
    allClear: 'Nothing is waiting for you.',
    unpriced: (n) =>
      `${n} ${n === 1 ? 'car has' : 'cars have'} no daily price. Renters can book a car only once it has one.`,
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
      price: {
        title: 'Price your cars',
        hint: 'A daily price on each car.',
        href: '/console/fleet',
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
    subtitle: 'Bookings on your cars, newest first.',
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
