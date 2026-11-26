// Messages between a renter and a rental company about a car.
export const messages = {
  title: 'Messages',
  chat: 'Chat',
  empty: 'No messages yet.',
  renterEmpty: 'Open a car and choose Chat to ask about it.',
  companyEmpty: 'Questions about your cars appear here.',
  back: 'Messages',
  label: 'Your message',
  helper: 'Phone numbers and email addresses stay hidden until a booking is confirmed.',
  send: 'Send',
  sending: 'Sending…',
  placeholder: 'Write a message',
  suggestions: [
    'Is it free for my dates?',
    'Can you deliver the car to me?',
    'What do I need to bring?',
  ],
  failed: 'The message did not send. Try again.',
  you: 'You',
  unread: 'Unread',
  car: {
    view: 'View car',
    perDay: '/ day',
    unlisted: 'No longer listed',
  },
  reservation: {
    none: { company: 'No reservation yet', renter: 'Not booked yet' },
    some: { company: 'Reservation', renter: 'Your booking' },
    open: 'Open',
    answerBy: (when) => `answer by ${when}`,
  },
  book: 'Book',
}
