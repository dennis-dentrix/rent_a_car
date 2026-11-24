import { createHash } from 'node:crypto'
import { brand, formatFullDate, formatMoney, formatTime } from '@carvo/shared'

// The wording of the rental agreement. Numbers that are business rules (grace period, cancellation window,
// minimum age) come from the settings table through `facts.rules`, so the agreement never disagrees with the
// system. Change the wording here and raise AGREEMENT_VERSION, so every signature records which wording was signed.
// The wording is a draft until the company's lawyer has reviewed it.
export const AGREEMENT_VERSION = '2026-11-draft'

const kes = (amount) => formatMoney(amount, 'KES')
export const when = (at) => `${formatFullDate(at)} at ${formatTime(at)}`

const paymentText = ({ booking }) => {
  const parts = [
    `The total hire charge is ${kes(booking.total_kes)}. A refundable deposit of ${kes(booking.deposit_kes)} is paid to confirm the booking and is part of the total, and the balance of ${kes(booking.balance_kes)} is paid as agreed with the Company.`,
  ]
  if (booking.security_deposit_kes > 0) {
    parts.push(
      `A separate security deposit of ${kes(booking.security_deposit_kes)} is held for the hire and is returned after the vehicle is checked on return, less any amount the Renter owes under this agreement.`,
    )
  }
  return parts.join(' ')
}

const CLAUSES = [
  [
    'The agreement',
    () =>
      `This agreement is between ${brand.legalName} (the Company) and the Renter named above, for the hire of the vehicle described above. By signing, the Renter confirms that the details above are correct and accepts these terms.`,
  ],
  [
    'Hire period and return',
    ({ rules }) =>
      `The vehicle is hired for the period above. It must be returned at the agreed place by the end time. A return up to ${rules.grace_minutes} minutes late is allowed; after that, the Company may charge an extra day at the daily rate.`,
  ],
  [
    'The driver',
    ({ rules }) =>
      `The Renter must be at least ${rules.minimum_age} years old and hold a valid driving licence and identity document, which the Company has checked. Only the Renter, and any other driver the Company has approved in writing, may drive the vehicle.`,
  ],
  ['Payment', paymentText],
  [
    'Cancelling and changing the booking',
    ({ rules }) =>
      `If the Renter cancels more than ${rules.cancellation_window_hours} hours before the start of the hire, the refundable deposit is returned in full. Within ${rules.cancellation_window_hours} hours of the start, it is not returned. The Renter may change the dates once, up to ${rules.cancellation_window_hours} hours before the start, and the price is worked out again for the new dates. A change of dates cancels this signature, and the Renter signs again.`,
  ],
  [
    'Use of the vehicle',
    () =>
      "The vehicle must be driven lawfully and with care. It must not be used for racing, towing, carrying passengers or goods for payment, driving under the influence of alcohol or drugs, or driving off a made road unless the Company agrees. It must not be sub-let or taken out of Kenya without the Company's written agreement. Smoking in the vehicle is not allowed.",
  ],
  [
    'Condition and fuel',
    () =>
      'The Company and the Renter record the condition, fuel level and mileage of the vehicle when it is handed over and when it is returned. The Renter returns it in the same condition, apart from fair wear, with the fuel level recorded at handover.',
  ],
  [
    'Accidents, damage and insurance',
    () =>
      'The vehicle is insured as explained to the Renter at handover. The Renter reports any accident, theft or damage to the Company and to the police straight away. The Renter is responsible for the insurance excess and for any loss or damage the insurance does not cover, including damage caused by breaking this agreement.',
  ],
  [
    'Fines and charges',
    () =>
      'The Renter pays all traffic fines, tolls, parking charges and similar costs that arise during the hire.',
  ],
  [
    'Tracking and personal data',
    () =>
      "Vehicles may carry a GPS tracker. The Company uses location data only to keep the vehicle safe, recover it if needed, and manage the fleet. The Company keeps the Renter's personal data as set out in its privacy notice and in line with the Data Protection Act, 2019 of Kenya.",
  ],
  [
    'Signing electronically',
    () =>
      'The Renter agrees that ticking the box and typing their name here, with a drawn signature if they add one, is their signature and has the same effect as signing on paper. The Company keeps a record of when and from where the agreement was signed.',
  ],
  [
    'Governing law',
    () =>
      'This agreement is governed by the laws of Kenya, and the courts of Kenya decide any dispute.',
  ],
]

/**
 * What the customer is shown and signs: the clauses with the booking's numbers filled in, a fingerprint of all of it,
 * and a snapshot of the facts, which is saved with the signature as the record of what was agreed.
 */
export function buildTerms(facts) {
  const clauses = CLAUSES.map(([title, text], index) => ({
    number: index + 1,
    title,
    text: text(facts),
  }))
  const sha256 = createHash('sha256')
    .update(JSON.stringify({ version: AGREEMENT_VERSION, facts, clauses }))
    .digest('hex')
  return { version: AGREEMENT_VERSION, clauses, sha256, facts }
}
