// The three service pages. Each answers one intent (docs/growth-seo.md section 4) and says only what is true
// of the product: no invented prices, ratings, or promises. The ids match packages/shared/src/services.js.
const faq = (items) => ({ title: 'Common questions', items })

export const servicePages = {
  tellTitle: 'Before you book',
  searchAction: 'Search cars',
  car_hire: {
    path: '/car-hire',
    crumb: 'Car hire',
    meta: {
      title: 'Car hire in Kenya: self-drive or with a driver',
      description:
        'Car hire and car rental in Kenya by the day, week or month. Drive yourself or have a driver. See the full price before you ask. No deposit is taken.',
    },
    hero: {
      badge: 'Car hire',
      title: 'Hire a car, your way.',
      subtitle:
        'Drive yourself or have a driver at the wheel. Hire by the day, week, or month, in town or upcountry, from approved rental companies.',
    },
    list: {
      title: 'Self-drive or chauffeur-driven',
      services: [
        {
          id: 'self_drive',
          title: 'Self-drive',
          text: 'You drive. You need a valid driving licence and an ID or passport, which you upload when you book.',
          action: 'Find a self-drive car',
        },
        {
          id: 'chauffeur_driven',
          title: 'Chauffeur-driven',
          text: 'A driver from the rental company takes the wheel, so you can work or rest on the way. The cost of the driver is shown before you ask.',
          action: 'Find a car with a driver',
        },
      ],
    },
    lengths: {
      title: 'By the day, the week, or the month',
      items: [
        {
          title: 'A day or a weekend',
          text: 'The daily price of the car you choose, for each day. A very short hire is charged at the minimum hire period, which your quote shows.',
        },
        {
          title: 'A week',
          text: 'When a weekly discount applies it appears in your quote as its own named line.',
        },
        {
          title: 'A month or longer',
          text: 'Monthly and longer discounts work the same way, so a longer hire can cost less per day.',
        },
      ],
    },
    carsTitle: 'Car types and daily rates',
    tell: {
      title: 'What you need',
      items: [
        'A valid driving licence',
        'An ID or passport',
        'Both uploaded as a JPG, PNG, or PDF photo',
        'A minute to sign the agreement online',
      ],
    },
    steps: {
      title: 'How to hire a car',
      items: [
        {
          title: 'Choose your dates and a car',
          text: 'See the daily rate before you ask.',
        },
        {
          title: 'Request your booking',
          text: 'The rental company confirms. You sign the agreement online.',
        },
        {
          title: 'Pick up and drive',
          text: 'Collect the car, or have it delivered. Return it on the date.',
        },
      ],
    },
    faq: faq([
      {
        q: 'Should I hire self-drive or with a driver?',
        a: 'Hire self-drive if you want the car to yourself and have your licence. Choose a driver if you would rather work, rest, or avoid unfamiliar roads. Both show their full price before you ask.',
      },
      {
        q: 'Can I hire a car for a month?',
        a: 'Yes. Monthly and longer hire is priced by the day with a discount where one applies, shown as a named line in your quote.',
      },
      {
        q: 'Can the car be delivered to me?',
        a: 'Delivery can be added to your quote, priced by area, and you see the cost before you confirm.',
      },
      {
        q: 'Do I pay a deposit?',
        a: 'Not for now. No deposit is taken when you book, and the price you see is the full price.',
      },
      {
        q: 'Can I take the car upcountry?',
        a: 'Tell us where you are going when you ask for a booking. The rental company confirms the trip with you.',
      },
      {
        q: 'What are the age and licence rules?',
        a: 'They depend on the car type and are shown before you request a booking.',
      },
    ]),
  },
  transfers: {
    path: '/transfers',
    crumb: 'Transfers',
    meta: {
      title: 'Airport and corporate transfers in Kenya',
      description:
        'Book an airport pickup or a corporate transfer with a driver from an approved rental company. Tell us the trip and see the price before you ask.',
    },
    hero: {
      badge: 'Transfers',
      title: 'Get there without the stress.',
      subtitle:
        'Airport pickups and drop-offs, and transfers for guests and staff, with a driver from an approved rental company.',
    },
    list: {
      title: 'Airport and corporate',
      services: [
        {
          id: 'airport_transfer',
          title: 'Airport transfers',
          text: 'Be collected from, or taken to, the airport. Tell us your flight number, how many people are travelling, and where you are going.',
          action: 'Search airport transfers',
        },
        {
          id: 'corporate_transfer',
          title: 'Corporate transfers',
          text: 'Move guests, staff, or visiting teams between the airport, offices, hotels, and meetings, with a driver.',
          action: 'Search corporate transfers',
        },
      ],
    },
    tell: {
      title: 'What to tell us',
      items: [
        'Where you are being collected',
        'Where you are going',
        'The date and the time',
        'How many people are travelling',
        'Your flight number, for an airport transfer',
      ],
      note: 'A transfer can be a single day, so you are not asked to pay for more days than you need.',
    },
    steps: {
      title: 'How a transfer works',
      items: [
        {
          title: 'Tell us the trip',
          text: 'Choose pick-up, drop-off, date, time, and passengers in the search.',
        },
        {
          title: 'See the price',
          text: 'The price is shown before you ask.',
        },
        {
          title: 'The rental company confirms',
          text: 'It confirms the booking and arranges your driver.',
        },
      ],
    },
    faq: faq([
      {
        q: 'How do I book an airport transfer?',
        a: 'Choose Transfers in the search, set your pick-up, drop-off, date, time, and number of passengers, and pick Airport transfer as the service. You see the price before you ask.',
      },
      {
        q: 'Is a driver included?',
        a: 'A transfer is a journey with a driver. The cost is shown before you ask for a booking.',
      },
      {
        q: 'Can I change my plans?',
        a: 'You can cancel from your account, and change the date once, up to 24 hours before pickup.',
      },
      {
        q: 'How do I pay?',
        a: 'Payment is arranged with the rental company. No deposit is taken when you book.',
      },
      {
        q: 'Can I hire a car for the whole stay instead?',
        a: 'Yes. See car hire for self-drive or chauffeur-driven cars by the day, week, or month.',
      },
    ]),
  },
  events: {
    path: '/events',
    crumb: 'Events',
    meta: {
      title: 'Wedding cars, video shoots and event transport in Kenya',
      description:
        'Cars for weddings, video shoots, convoys and corporate transport from approved rental companies in Kenya. Tell us the day, the place and how many cars.',
    },
    hero: {
      badge: 'Events',
      title: 'The right cars for the big day.',
      subtitle:
        'Wedding cars, vehicles for video shoots, convoys, and corporate transport, from approved rental companies.',
    },
    list: {
      title: 'Four kinds of event',
      services: [
        {
          id: 'wedding_car',
          title: 'Wedding car hire',
          text: 'A car for the couple, or several for the wedding party. Tell us the date, the venues, and how many cars you need.',
          action: 'Search wedding cars',
        },
        {
          id: 'video_shoot',
          title: 'Video shoots',
          text: 'Vehicles for filming, for the day. Tell us where you are shooting and the kind of car the scene needs.',
          action: 'Search shoot vehicles',
        },
        {
          id: 'convoy',
          title: 'Convoys',
          text: 'Several cars moving together for a delegation, a family, or a group. Tell us how many cars and the route.',
          action: 'Search convoy cars',
        },
        {
          id: 'corporate_transport',
          title: 'Corporate transport',
          text: 'Cars for teams and guests at a conference, launch, or company event.',
          action: 'Search corporate transport',
        },
      ],
    },
    tell: {
      title: 'What to tell us',
      items: [
        'The date and the start time',
        'Where it is, and where the cars should be',
        'How many cars you need',
        'Any kind of car you would like',
        'Anything the rental company should know about the route',
      ],
    },
    steps: {
      title: 'How booking for an event works',
      items: [
        {
          title: 'Tell us about the event',
          text: 'Choose the service, the place, the date, and how many cars.',
        },
        { title: 'Compare and request', text: 'See the car types and the price before you ask.' },
        {
          title: 'The rental company confirms',
          text: 'It confirms each car, and you sign the agreement online.',
        },
      ],
    },
    faq: faq([
      {
        q: 'How many cars can I ask for?',
        a: 'You choose the number when you search, and the rental company confirms what it can provide.',
      },
      {
        q: 'Can I choose the type of car?',
        a: 'Yes. Browse the car types and their daily rates, or filter by the service you need.',
      },
      {
        q: 'Is a driver included?',
        a: 'That depends on the service and the rental company. It is shown before you ask for a booking.',
      },
      {
        q: 'How far ahead should I ask?',
        a: 'As early as you can. The rental company has to confirm each car, and popular dates fill first.',
      },
      {
        q: 'Can I change or cancel?',
        a: 'You can cancel from your account, and change the date once, up to 24 hours before pickup.',
      },
    ]),
  },
}
