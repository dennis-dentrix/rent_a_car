// Home page text. Every statement here follows a ruling in docs/CLAUDE.md or the product pack; nothing
// claims reviews, ratings, or features that are not built.
export const home = {
  meta: {
    title: 'Car hire in Kenya: car rental by the day, week or month',
    description:
      'Car hire and car rental in Kenya from approved rental companies. By the day, week or month, with or without a driver. See the full price first.',
  },
  seoIntro: {
    title: 'Car hire and car rental in Kenya, without the guesswork',
    paragraphs: [
      'Carvo is where you find car hire in Kenya from approved rental companies. Choose a car for a day, a weekend, a week or a month, drive yourself or have a driver, and see the full price before you ask. No deposit is taken.',
      'Whether you want an economy car for the city, an SUV for a family trip, a van for a group, or cars for a wedding, you can compare car rental in Kenya in one place. If you want help choosing, start with our [car hire guides](/blog).',
    ],
  },
  badge: 'Approved rental companies across Kenya',
  title: 'Arrive in the right car.',
  subtitle:
    'Choose by the day, the week, or the month, with or without a driver. You see the full price before you ask, and no deposit is taken.',
  trust: ['Approved rental companies', 'No deposit to book', 'Prices shown up front'],
  eyebrows: {
    services: 'What we offer',
    fleet: 'Curated fleet',
    price: 'No surprises',
    how: 'The journey',
    know: 'Before you book',
    faq: 'Questions',
  },
  servicesIntro: {
    title: 'Everything you need to get there',
    text: 'One place for the car, the driver, and the occasion. Rental companies choose which of these they offer, and you can filter by them.',
  },
  classesTitle: 'Popular car types',
  seeAll: 'See all cars',
  price: {
    title: 'How your price is built',
    intro: 'You see the full price, line by line, before you ask for a booking.',
    lines: [
      { title: 'Car hire', text: 'The daily rate for your car type, for each day of your stay.' },
      {
        title: 'Longer-hire discount',
        text: 'Hire for a week, a month, or longer and the best discount for your stay appears as its own named line.',
      },
      {
        title: 'Delivery and extras',
        text: 'Only if you add them. Delivery is priced by area and shown before you confirm.',
      },
      {
        title: 'No deposit',
        text: 'For now we take no deposit, so there is no extra amount held against the car.',
      },
    ],
  },
  howTitle: 'How it works',
  steps: [
    {
      title: 'Choose your dates and a car',
      text: 'See the daily price before you ask.',
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
  know: {
    title: 'Good to know',
    bring: {
      title: 'What you need',
      items: [
        'A valid driving licence',
        'An ID or passport',
        'Both uploaded as a JPG, PNG, or PDF photo',
        'A minute to sign the agreement online',
      ],
      note: (megabytes) => `Each file can be up to ${megabytes} MB.`,
    },
    rules: {
      title: 'Changes and cancellation',
      items: [
        'No deposit is taken when you book.',
        'You can cancel from your account.',
        'Change your dates once, up to 24 hours before pickup. The price is recalculated.',
      ],
    },
  },
  faq: {
    title: 'Your questions, answered',
    items: [
      {
        q: 'Can I hire a car with a driver?',
        a: 'Yes, on cars whose rental company offers one. Choose With driver when you search, and the cost is shown before you ask.',
      },
      {
        q: 'How do I pay?',
        a: 'Payment is arranged with the rental company when you collect the car. No deposit is taken when you book.',
      },
      {
        q: 'Do I pay a deposit?',
        a: 'Not for now. No deposit is taken when you book, and the price you see is the full price.',
      },
      {
        q: 'Can I cancel or change my booking?',
        a: 'Yes. You can cancel from your account, and change your dates once, up to 24 hours before pickup. The price is recalculated.',
      },
      {
        q: 'What do I need to hire a car?',
        a: 'A valid driving licence and an ID or passport. Age and licence rules depend on the car type and are shown before you request a booking.',
      },
      {
        q: 'Which currency do I pay in?',
        a: 'Prices are shown in Kenyan shillings. If you are outside Kenya you can view US dollars, but you are charged in shillings.',
      },
      {
        q: 'Can the car be brought to me?',
        a: 'Delivery can be added to your quote, priced by area, and you see the cost before you confirm.',
      },
    ],
  },
  help: {
    title: 'Ready when you are',
    text: 'Pick your dates and see what is free, or talk to a person. Either way you see the price before you commit.',
    actions: [
      { title: 'Choose your dates', text: 'See which cars are free and what they cost.' },
      { title: 'Message us', text: 'Ask a question here and we will reply to your email.' },
      { title: 'Call us', text: 'Speak to a person about your booking.' },
    ],
    sticky: 'Find a car',
  },
}
