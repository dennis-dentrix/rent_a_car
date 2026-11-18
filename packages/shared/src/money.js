// Money is an integer number of shillings. The only place amounts are formatted or converted.

export const assertKes = (amount) => {
  if (!Number.isInteger(amount)) {
    throw new TypeError('Money must be a whole number of KES.')
  }
  return amount
}

/** Convert whole KES to a display currency. `rateToKes` is KES per one unit (exchange_rates.rate_to_kes). */
export const convertFromKes = (kes, rateToKes) => {
  assertKes(kes)
  return Math.round(kes / rateToKes)
}

/** "KES 12,500", "USD 95". Display only; never stored as a booking total. */
export const formatMoney = (amount, currency = 'KES') =>
  `${currency} ${Math.round(amount).toLocaleString('en-US')}`
