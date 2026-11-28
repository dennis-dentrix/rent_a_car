// What is said when something does not work. Plain words, and what to do next.
export const errors = {
  offline: 'That did not go through. Check your connection and try again.',
  unreachable: 'We could not reach the server. Try again in a moment.',
  banner: 'You are offline. Changes will not save until the connection is back.',
  saving: 'Saving…',
  page: {
    title: 'Something went wrong',
    text: 'The page could not be shown. Nothing you saved is lost.',
    retry: 'Try again',
    home: 'Go to the home page',
    reference: (code) => `Reference ${code}`,
  },
  notFound: {
    title: 'We cannot find that page',
    text: 'It may have moved, or the car or booking is no longer available to you.',
    cars: 'See available cars',
  },
}
