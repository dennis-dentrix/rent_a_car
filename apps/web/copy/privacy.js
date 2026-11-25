// The privacy policy, in plain language. A DRAFT for lawyer review before launch (docs/product-pack.md §7): the facts
// in it match what the system does today, but the legal wording, the controller registration, and the retention
// periods are for the lawyer and the owner. When a fact in the system changes (a new provider, a payment method, a new
// kind of data), change it here first. Same shape as a guide section: id, heading, paragraphs, optional items.
export const privacy = {
  path: '/privacy',
  crumb: 'Privacy policy',
  title: 'Privacy policy',
  updated: 'Last updated 25 November 2026',
  contents: 'In this policy',
  intro:
    'This policy explains what personal information Carvo collects, why, who sees it, and the choices you have. It covers this website and everything you do on it: asking about a car, booking, signing in, and uploading documents.',
  meta: {
    title: 'Privacy policy',
    description:
      'What personal information Carvo collects, why we use it, who sees it, how long we keep it, and your rights under the Data Protection Act, 2019.',
  },
  sections: [
    {
      id: 'who-we-are',
      heading: 'Who we are',
      paragraphs: [
        "Carvo is run by Dirant Technologies. We decide how and why your personal information is used, which makes us the data controller under Kenya's Data Protection Act, 2019.",
        'Carvo is a marketplace. The cars belong to rental companies, and when you ask to hire a car we pass the rental company what it needs to serve you. The rental company is responsible for how it uses that information for your rental.',
      ],
    },
    {
      id: 'what-we-collect',
      heading: 'What we collect',
      paragraphs: [
        'We collect only what a booking or a question needs. You do not pay on the site at the moment, so we do not collect card or mobile money details. If that changes, we will update this page first.',
      ],
      items: [
        'Your account: your name, email address, and phone number, written with the country code. Your password is stored in protected form by our sign-in service, so we cannot read it.',
        'Your requests: the car type, dates, and pick-up and drop-off places you type, and any message you send us.',
        'Your documents: a photo or scan of your ID or passport and your driving licence, when a booking needs them.',
        'Your signature: when you sign a rental agreement online, your typed name, your drawn signature if you add one, and the time and network address of your device.',
        'A profile picture, if you choose to add one.',
        'How you use the site, but only if you press Accept on the cookie notice. See the section on analytics.',
      ],
    },
    {
      id: 'why-we-use-it',
      heading: 'Why we use it',
      paragraphs: [
        'We use your information because we need it to give you the service you asked for, because the law requires it, because we have a fair interest in running a safe and useful service, or because you agreed. We send marketing messages only if you opt in, and you can change that in [Settings](/settings).',
      ],
      items: [
        'To answer your questions and handle your booking, including telling the rental company what it needs to serve you.',
        'To check who is hiring and that they may drive, before a car is handed over.',
        'To send emails about your account and your booking, such as confirmations and reminders.',
        'To keep the site secure and to prevent fraud and misuse.',
        'To understand how the site is used and to improve it, if you press Accept.',
        'To meet our legal duties.',
      ],
    },
    {
      id: 'your-documents',
      heading: 'How we protect your documents',
      paragraphs: [
        'Your ID and driving licence are the most sensitive things we hold, so they are handled with extra care.',
      ],
      items: [
        'Files go to private storage and are never linked publicly.',
        'Only authorised staff can open them. Each opening needs a stated reason, and we record who opened the file, when, and why.',
        'A link to view a file works for a short time and then stops.',
        'We accept JPG, PNG, and PDF files up to 10 MB.',
      ],
    },
    {
      id: 'who-sees-it',
      heading: 'Who sees your information',
      paragraphs: [
        'We do not sell your personal information. These are the people and services that handle it:',
      ],
      items: [
        'The rental company for your booking sees the details it needs, such as your name, contact details, and dates.',
        'Our staff see what they need to run bookings and to help you.',
        'Supabase hosts our database and sign-in service, with servers in Ireland.',
        'Cloudflare delivers the site, stores uploaded files, and resizes pictures.',
        'ZeptoMail sends our emails.',
        'Google Places suggests places as you type a pick-up or drop-off place. It receives only the text you type, with no name or contact details.',
        'PostHog counts how the site is used, but only if you press Accept.',
        'Authorities, when the law requires us to share information.',
      ],
    },
    {
      id: 'other-countries',
      heading: 'Where your information goes',
      paragraphs: [
        'Our services run outside Kenya. Our database is in Ireland, our analytics service stores its counts in the United States, and Cloudflare and Google operate worldwide. When personal information leaves Kenya, we send it with the safeguards that the Data Protection Act requires.',
      ],
    },
    {
      id: 'cookies',
      heading: 'Cookies',
      paragraphs: [
        'We use cookies and similar storage on your device to keep the site working. They keep you signed in, remember your display currency and your light or dark setting, and remember your answer to the cookie notice.',
      ],
    },
    {
      id: 'analytics',
      heading: 'Analytics',
      paragraphs: [
        'When you press Accept on the cookie notice, we count how the site is used so that we can improve it. We use PostHog for this, and it stores the counts in the United States.',
        'We count only a short list of actions: which car types are viewed, how many days a search covers, and whether the find a car button is used. With each one we add the kind of device, the page, and where the visit came from. We never record your name, contact details, or what you type, and we cut page addresses off before the question mark, so a search never travels with them. Nothing is counted inside your account or in staff areas.',
        'You can turn analytics off at any time with the Turn off analytics link at the bottom of any page. That also removes what it stored on your device.',
      ],
    },
    {
      id: 'how-long',
      heading: 'How long we keep it',
      paragraphs: [
        'We keep personal information only as long as we need it for the reasons above and as the law requires. Identity and rental records are kept for the period the law requires, and are then deleted or made anonymous. We are confirming the exact periods and will publish them here.',
      ],
    },
    {
      id: 'security',
      heading: 'How we keep it safe',
      paragraphs: [
        'No system is completely secure, so we also plan for the unexpected. If something goes wrong with your information, we will tell you, and the regulator, as the law requires.',
      ],
      items: [
        'Pages and files move over an encrypted connection.',
        'Each person can read only their own bookings and documents, and the database enforces this rule itself.',
        'Staff and admin accounts need a second step to sign in.',
        'We limit who can see documents, and we record each time one is opened.',
      ],
    },
    {
      id: 'your-rights',
      heading: 'Your rights',
      paragraphs: ['Under the Data Protection Act, 2019, you can:'],
      items: [
        'Ask what information we hold about you, and get a copy.',
        'Ask us to correct information that is wrong.',
        'Ask us to delete your information. We may need to keep records that the law requires, or the records of a booking that is still open.',
        'Object to how we use your information, or ask us to limit it.',
        'Take back an agreement you gave, such as to analytics or marketing messages.',
      ],
    },
    {
      id: 'age',
      heading: 'Age',
      paragraphs: [
        'Renters must be at least 21 years old. Carvo is not meant for children, and we do not knowingly collect information from them.',
      ],
    },
    {
      id: 'changes',
      heading: 'Changes to this policy',
      paragraphs: [
        'We may update this policy. When we make an important change, we will say so on this page and change the date at the top.',
      ],
    },
  ],
  contact: {
    title: 'Questions or requests',
    text: "To use any of your rights, or to ask us about this policy, send us a message. If you are not happy with our answer, you can complain to Kenya's Office of the Data Protection Commissioner.",
    button: 'Message us',
    message: 'A question about the privacy policy',
  },
}
