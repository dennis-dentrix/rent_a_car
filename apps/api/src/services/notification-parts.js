import { formatMoney, formatShortDate, formatTime } from '@carvo/shared'

// The pieces of wording that more than one email uses.
export const when = (at) => `${formatShortDate(at)} at ${formatTime(at)}`
export const stay = ({ booking }) =>
  `Booking ${booking.reference}: pickup ${when(booking.start_at)}, return ${when(booking.end_at)}.`
export const money = (kes) => formatMoney(kes, 'KES')
export const reason = ({ payload }) => (payload.note ? [`Reason: ${payload.note}.`] : [])
