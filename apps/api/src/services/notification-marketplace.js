import { money, reason, stay, when } from './notification-parts.js'

// Emails of the marketplace: requests to book, messages, and what a rental company is told. `isForCompany` sends the
// reader to their console rather than a renter's account.
const answerBy = ({ booking }) =>
  booking.hold_expires_at ? [`Answer by ${when(booking.hold_expires_at)}.`] : []

const forCompany = (subject, body) => ({ isForCompany: true, subject, body })

export const MARKETPLACE_TEMPLATES = {
  booking_requested: {
    subject: ({ booking }) => `Your request ${booking.reference} is with the company`,
    body: (ctx) => [
      'The rental company will accept or decline your request. Nothing is booked until it accepts.',
      stay(ctx),
    ],
  },
  booking_declined: {
    subject: ({ booking }) => `Your request ${booking.reference} was declined`,
    body: (ctx) => [
      'The rental company could not take this booking.',
      stay(ctx),
      ...reason(ctx),
      'Other cars are free to book.',
    ],
  },
  request_expired: {
    subject: ({ booking }) => `Your request ${booking.reference} was not answered`,
    body: (ctx) => [
      'The rental company did not answer in time, so the request has ended.',
      stay(ctx),
      'Other cars are free to book.',
    ],
  },
  company_request: forCompany(
    ({ booking }) => `New booking request ${booking.reference}`,
    (ctx) => [
      'A renter is asking to book your car.',
      stay(ctx),
      `Total: ${money(ctx.booking.total_kes)}.`,
      ...answerBy(ctx),
    ],
  ),
  company_booked: forCompany(
    ({ booking }) => `New booking ${booking.reference}`,
    (ctx) => [
      'A renter has booked your car.',
      stay(ctx),
      `Total: ${money(ctx.booking.total_kes)}, paid to you at pickup.`,
      'Check the renter’s ID and licence before the handover.',
    ],
  ),
  company_cancelled: forCompany(
    ({ booking }) => `Booking ${booking.reference} was cancelled`,
    (ctx) => ['The renter cancelled this booking.', stay(ctx), ...reason(ctx)],
  ),
  company_dates_changed: forCompany(
    ({ booking }) => `Dates changed for booking ${booking.reference}`,
    (ctx) => ['The dates of this booking have changed.', stay(ctx)],
  ),
  company_request_expired: forCompany(
    ({ booking }) => `Request ${booking.reference} expired unanswered`,
    (ctx) => ['This request was not answered in time, so it has ended.', stay(ctx)],
  ),
  message_received: {
    subject: ({ payload }) => `New message about the ${payload.car}`,
    body: ({ payload }) => [`${payload.from} sent you a message. Open it to read and reply.`],
  },
}
