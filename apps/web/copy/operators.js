// The page for rental companies. Every claim follows product pack section 25: free in the early stage, listed
// after Carvo reviews the company, owner details private to the operator, chauffeurs verified by the operator.
// A company creates its own account here; it is listed once it has been reviewed.
export const operators = {
  path: '/operators',
  crumb: 'For rental companies',
  meta: {
    title: 'List your rental fleet in Kenya',
    description:
      'Rent out your cars to renters across Kenya. Free while we launch, listed after a short review. Create your company account, or ask our team what is on offer.',
  },
  hero: {
    badge: 'For rental companies',
    title: 'Put your fleet in front of renters.',
    subtitle:
      'Carvo connects approved rental companies with people who need a car, a driver, or a car for an occasion. It is free while we launch.',
    apply: 'Create a company account',
    signIn: 'Sign in',
    ask: 'Talk to our team',
  },
  why: {
    eyebrow: 'Why join',
    title: 'Built for companies that already run a fleet',
    items: [
      {
        title: 'Free while we launch',
        text: 'There is no charge in the early stage and no commission at launch. Plans come later, with notice, and a 30-day trial before any subscription.',
      },
      {
        title: 'Found for what you offer',
        text: 'Renters search by car type and by service: self-drive, chauffeur-driven, transfers, and events. You choose which services you offer.',
      },
      {
        title: 'You stay in charge',
        text: 'You decide which cars to list, whether a car comes with a driver and at what cost, and which bookings you accept.',
      },
    ],
  },
  offer: {
    eyebrow: 'What is on offer',
    title: 'Tools for running your fleet on Carvo',
    note: 'Rental companies get access in stages while we finish the tools. Applying now puts you at the front of the line.',
    items: [
      {
        title: 'Your fleet, listed properly',
        text: 'Add each car with its car type, and say whether it is your own or managed for an owner.',
      },
      {
        title: 'Owner details stay private',
        text: 'If you manage cars for individual owners, their details are visible to your team only. Renters see your company, never the owner.',
      },
      {
        title: 'Services you choose',
        text: 'Switch on car hire, transfers, and event cars one by one, and say if a car comes with a chauffeur.',
      },
      {
        title: 'Booking requests',
        text: 'Review each request for your cars and accept or decline it.',
      },
      {
        title: 'Handover records',
        text: 'Record the condition of a car at pickup and return, with photos, so both sides have the same record.',
      },
      {
        title: 'Your drivers',
        text: 'Keep your chauffeurs on record. You are responsible for checking them, and you confirm that when you list a driver.',
      },
    ],
  },
  steps: {
    eyebrow: 'The journey',
    title: 'How joining works',
    items: [
      { title: 'Apply', text: 'Tell us about your company and your fleet using the form below.' },
      { title: 'We review', text: 'Our team looks at your documents and gets in touch.' },
      { title: 'List your cars', text: 'Add your fleet and choose the services you offer.' },
      {
        title: 'Receive requests',
        text: 'Renters find you, and you accept the bookings you want.',
      },
    ],
  },
  documents: {
    title: 'What we will ask for',
    items: [
      'Your business registration',
      'Your KRA PIN',
      'Your business address',
      'Your insurance certificate',
      'The logbook for each vehicle you list',
    ],
    note: 'You can send these after you apply. We use them only to review your company.',
  },
  join: {
    eyebrow: 'Join',
    title: 'Start in a few minutes',
    text: 'Create your company account, confirm your email, and we start the review. You can sign in at any time to see where it stands.',
    create: 'Create a company account',
    signIn: 'Already have one? Sign in',
    openDashboard: 'Open your dashboard',
    openAdmin: 'Open admin',
  },
  talk: {
    title: 'Prefer to talk first?',
    text: 'Ask us what is on offer, how review works, or how your cars would appear. We reply to your email.',
    action: 'Ask the Carvo team',
    message: 'Hello, I run a rental company and would like to know what is on offer for operators.',
  },
  faq: {
    eyebrow: 'Questions',
    title: 'Questions from rental companies',
    items: [
      {
        q: 'Does it cost anything to join?',
        a: 'Not in the early stage. There is no subscription and no commission at launch. Later there will be plans, with a 30-day trial first, and we will tell you before anything changes.',
      },
      {
        q: 'How do I get approved?',
        a: 'Apply here. Our team reviews your company and your documents, and gets in touch. You are listed once the review is done.',
      },
      {
        q: 'Can I list cars I manage for other owners?',
        a: 'Yes. You say which cars are your own and which are managed. Owner details are visible to your team only and never to renters.',
      },
      {
        q: 'Who is responsible for the drivers?',
        a: 'You are. When a car comes with a chauffeur, you check the driver and confirm that the licence and the insurance cover it.',
      },
      {
        q: 'Can renters see my phone number?',
        a: 'Contact details are kept inside the platform until a booking is confirmed.',
      },
    ],
  },
}
