import { brand, formatMoney, formatShortDate, formatTime } from '@carvo/shared'

// The wording of every email. One entry per kind: a subject and the paragraphs of the body. The context holds
// the notification's saved details and the booking as it is now, so a cancellation shows the refund as recorded.

const when = (at) => `${formatShortDate(at)} at ${formatTime(at)}`
const stay = ({ booking }) =>
  `Booking ${booking.reference}: pickup ${when(booking.start_at)}, return ${when(booking.end_at)}.`
const money = (kes) => formatMoney(kes, 'KES')
const contact = `Questions? Call or WhatsApp us on ${brand.supportPhone}.`

const refundLine = ({ booking }) =>
  booking.refund_due_kes > 0
    ? [
        `Your refundable deposit of ${money(booking.refund_due_kes)} is due back to you. We will confirm once it is sent.`,
      ]
    : []

const enquiryDetails = ({ payload }) => [
  `Name: ${payload.name ?? 'not given'}`,
  `Phone: ${payload.phone ?? 'not given'}`,
  `Email: ${payload.email ?? 'not given'}`,
  `Dates: ${payload.start_at ? `${when(payload.start_at)} to ${when(payload.end_at)}` : 'not given'}`,
  `Message: ${payload.message ?? 'none'}`,
]

export const TEMPLATES = {
  booking_received: {
    subject: ({ booking }) => `We have your booking ${booking.reference}`,
    body: (ctx) => [
      'Thank you for booking with us. Your vehicle is held while we complete your booking.',
      stay(ctx),
      `Total: ${money(ctx.booking.total_kes)}. Refundable deposit: ${money(ctx.booking.deposit_kes)}.`,
    ],
  },
  booking_confirmed: {
    subject: ({ booking }) => `Booking ${booking.reference} is confirmed`,
    body: (ctx) => [
      'Your booking is confirmed.',
      stay(ctx),
      'Next, please upload your ID and driving licence, and read and sign your rental agreement in your account. We cannot have your vehicle ready until these are done.',
    ],
  },
  booking_ready: {
    subject: ({ booking }) => `Your vehicle for ${booking.reference} is ready`,
    body: (ctx) => ['Your vehicle is ready for you.', stay(ctx)],
  },
  booking_cancelled: {
    subject: ({ booking }) => `Booking ${booking.reference} is cancelled`,
    body: (ctx) => ['Your booking has been cancelled.', stay(ctx), ...refundLine(ctx)],
  },
  booking_expired: {
    subject: ({ booking }) => `Booking ${booking.reference} was not completed`,
    body: (ctx) => [
      'Your booking was not completed in time, so the vehicle has been released.',
      stay(ctx),
      'You are welcome to book again.',
    ],
  },
  dates_changed: {
    subject: ({ booking }) => `Dates changed for booking ${booking.reference}`,
    body: (ctx) => [
      'The dates of your booking have been changed.',
      stay(ctx),
      `New total: ${money(ctx.booking.total_kes)}.`,
      'If you had already signed your rental agreement, please sign it again for the new dates.',
    ],
  },
  agreement_signed: {
    subject: ({ booking }) => `Your rental agreement for ${booking.reference} is signed`,
    body: (ctx) => [
      'Thank you for signing your rental agreement. A copy is in your account.',
      stay(ctx),
    ],
  },
  document_rejected: {
    subject: () => 'We could not accept your document',
    body: ({ payload }) => [
      `We could not accept your ${String(payload.document_type).replace('_', ' ')}.`,
      `Reason: ${payload.reason ?? 'not given'}.`,
      'Please upload a clear copy from your account.',
    ],
  },
  enquiry_received: {
    subject: () => 'We received your enquiry',
    body: () => [
      'Thank you for your enquiry. Our team will reply shortly with availability and a price.',
    ],
  },
  enquiry_alert: {
    subject: () => 'New enquiry from the website',
    body: (ctx) => enquiryDetails(ctx),
  },
}

const escapeHtml = (text) =>
  String(text).replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c],
  )

/** The email for a notification: subject, plain text, and a simple HTML version. Null for an unknown kind. */
export function renderEmail(kind, context) {
  const template = TEMPLATES[kind]
  if (!template) return null
  const paragraphs = [...template.body(context), contact]
  return {
    subject: template.subject(context),
    text: `${paragraphs.join('\n\n')}\n\n${brand.name}`,
    html:
      `<div style="font-family:sans-serif;line-height:1.5">` +
      `${paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('')}<p>${escapeHtml(brand.name)}</p></div>`,
  }
}
