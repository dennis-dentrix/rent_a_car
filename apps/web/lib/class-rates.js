const isInForce = (rate, today) =>
  rate.effective_from <= today && (!rate.effective_to || rate.effective_to >= today)

/**
 * The price per day each class falls back to when a car has none of its own, as { [classId]: { amountKes, isOwn } }:
 * the company's own rate for the class when one is in force, otherwise Carvo's.
 */
export function classRates(classes, ownRates, today) {
  const carvo = classes
    .filter((entry) => entry.price_per_day_kes)
    .map((entry) => [entry.id, { amountKes: entry.price_per_day_kes, isOwn: false }])
  const own = ownRates
    .filter((rate) => isInForce(rate, today))
    .map((rate) => [rate.class_id, { amountKes: rate.price_kes, isOwn: true }])
  return Object.fromEntries([...carvo, ...own])
}

/**
 * Each class as the company's price list shows it: what the company charges today (null when it has set nothing), and
 * what a renter pays today, which is Carvo's rate for a listed class.
 */
export function classPriceRows({ classes, ownRates, listed }, today) {
  const own = new Map(
    ownRates.filter((rate) => isInForce(rate, today)).map((rate) => [rate.class_id, rate]),
  )
  const renter = new Map(listed.map((entry) => [entry.id, entry.price_per_day_kes]))
  return classes.map((item) => ({
    ...item,
    ownKes: own.get(item.id)?.price_kes ?? null,
    renterKes: renter.get(item.id) ?? null,
  }))
}
