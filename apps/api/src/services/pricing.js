import { assertKes } from '@carvo/shared'

// The pricing service: the only place prices and totals are calculated.
// Pure functions. Rates, extras, discounts, and percentages are passed in from the database.
// Money is integer KES. Each amount is rounded once, where it is produced.

const DAY_MS = 24 * 60 * 60 * 1000

/** Chargeable days are whole 24-hour periods, rounded up, and never fewer than `minimumDays`. */
export const rentalDays = (startAt, endAt, minimumDays = 1) => {
  const ms = new Date(endAt).getTime() - new Date(startAt).getTime()
  return Math.max(minimumDays, Math.ceil(ms / DAY_MS))
}

/** A rental has the configured minimum (2 days). An airport transfer can be a single day. */
export const minimumHireDays = (service, configuredDays) =>
  service === 'airport_transfer' ? 1 : configuredDays

/**
 * What the chauffeur adds to each day of a hire of this car: 0 when driving yourself, or null when the car cannot be
 * hired that way. A car offered only with a chauffeur always includes one.
 */
export function chauffeurDailyKes(car, wantsChauffeur) {
  const { chauffeur_option: option, chauffeur_daily_kes: dailyKes } = car
  if (!wantsChauffeur && option !== 'chauffeur') return 0
  const isOffered = option === 'chauffeur' || option === 'both'
  return isOffered && dailyKes ? dailyKes : null
}

/** The chargeable days of a hire of one car and what they cost, or null when it cannot be hired that way. */
export function calculateStay(car, { startAt, endAt, minimumDays, withChauffeur = false }) {
  const chauffeurKes = chauffeurDailyKes(car, withChauffeur)
  if (chauffeurKes === null) return null
  const days = rentalDays(startAt, endAt, minimumDays)
  return { days, total_kes: (assertKes(car.daily_rate_kes) + chauffeurKes) * days }
}

/** Deposit is a percentage of the total, rounded down to a whole shilling. */
export const calculateDepositKes = (totalKes, depositPercent) =>
  Math.floor((assertKes(totalKes) * depositPercent) / 100)

/** VAT already included in a VAT-inclusive total, rounded to the nearest shilling. */
export const vatIncludedKes = (totalKes, vatPercent) =>
  Math.round((assertKes(totalKes) * vatPercent) / (100 + vatPercent))

/**
 * Pick the discount that saves the customer the most.
 * Discounts apply to the vehicle charge only, never to delivery fees or the security deposit.
 *
 * @param {Array<{ id: string, label: string, min_days: number, kind: 'percent'|'fixed', value: number }>} discounts
 *   Active discounts already filtered by class and date.
 * @param {{ days: number, vehicleChargeKes: number }} context
 * @returns {{ id: string, label: string, amountKes: number } | null}
 */
export function bestDiscount(discounts, { days, vehicleChargeKes }) {
  const saving = (discount) =>
    discount.kind === 'percent'
      ? Math.floor((vehicleChargeKes * discount.value) / 100)
      : discount.value

  const candidates = discounts
    .filter((discount) => discount.min_days <= days)
    .map((discount) => ({
      id: discount.id,
      label: discount.label,
      minDays: discount.min_days,
      // A discount can never take the vehicle charge below zero.
      amountKes: Math.min(saving(discount), vehicleChargeKes),
    }))
    .filter((candidate) => candidate.amountKes > 0)

  // Largest saving wins; on a tie the discount with the higher minimum days (the more specific one).
  candidates.sort((a, b) => b.amountKes - a.amountKes || b.minDays - a.minDays)
  const [winner] = candidates
  return winner ? { id: winner.id, label: winner.label, amountKes: winner.amountKes } : null
}

/**
 * The platform discounts that may reduce the price of a particular car, which its company set: none, until the owner
 * rules otherwise, so no company's price is cut without its agreement.
 *
 * @param {Array<object>} _platformDiscounts active discounts, filtered by class and date
 * @returns {Array<object>}
 */
export const discountsForCar = (_platformDiscounts) => []

/**
 * @typedef {{ kind: 'charge'|'discount'|'tax'|'refundable_deposit'|'security_deposit', label: string, amountKes: number }} QuoteLine
 */

const line = (kind, label, amountKes) => ({ kind, label, amountKes })

/** `[item]` when the condition holds, otherwise no items. Keeps optional lines out of `if` blocks. */
const when = (condition, item) => (condition ? [item] : [])

const discountLines = (discount) =>
  discount ? [line('discount', discount.label, -discount.amountKes)] : []

const extraLines = (extras, days) =>
  extras.map((extra) => {
    const quantity = extra.pricingType === 'per_day' ? days : 1
    return line('charge', extra.name, assertKes(extra.priceKes) * quantity)
  })

/** The lines that add up to the total: vehicle, discount, extras, delivery. */
function chargeLines({ dailyRateKes, days, extras, deliveryFeeKes, discounts }) {
  const vehicleChargeKes = assertKes(dailyRateKes) * days
  const discount = bestDiscount(discounts, { days, vehicleChargeKes })
  return [
    line('charge', `Vehicle, ${days} day(s)`, vehicleChargeKes),
    ...discountLines(discount),
    ...extraLines(extras, days),
    ...when(deliveryFeeKes > 0, line('charge', 'Delivery', deliveryFeeKes)),
  ]
}

/** Lines shown after the total: VAT included, the refundable deposit (none while the percent is 0), the security deposit. */
const summaryLines = ({ totalKes, vatPercent, depositKes, securityDepositKes }) => [
  ...when(
    vatPercent > 0,
    line('tax', `VAT included (${vatPercent}%)`, vatIncludedKes(totalKes, vatPercent)),
  ),
  ...when(depositKes > 0, line('refundable_deposit', 'Refundable deposit', depositKes)),
  ...when(securityDepositKes > 0, line('security_deposit', 'Security deposit', securityDepositKes)),
]

/**
 * @param {{
 *   dailyRateKes: number, days: number,
 *   extras?: Array<{ name: string, priceKes: number, pricingType: 'per_day'|'per_booking' }>,
 *   deliveryFeeKes?: number,
 *   discounts?: Array<object>,
 *   depositPercent: number, vatPercent?: number, securityDepositKes?: number,
 * }} input
 * @returns {{ lines: QuoteLine[], totalKes: number, depositKes: number, balanceKes: number, securityDepositKes: number }}
 */
export function calculateQuote({
  dailyRateKes,
  days,
  extras = [],
  deliveryFeeKes = 0,
  discounts = [],
  depositPercent,
  vatPercent = 0,
  securityDepositKes = 0,
}) {
  const charges = chargeLines({ dailyRateKes, days, extras, deliveryFeeKes, discounts })
  const totalKes = charges.reduce((sum, charge) => sum + charge.amountKes, 0)
  const depositKes = calculateDepositKes(totalKes, depositPercent)
  const summary = summaryLines({ totalKes, vatPercent, depositKes, securityDepositKes })

  return {
    lines: [...charges, ...summary],
    totalKes,
    depositKes,
    balanceKes: totalKes - depositKes,
    securityDepositKes,
  }
}
