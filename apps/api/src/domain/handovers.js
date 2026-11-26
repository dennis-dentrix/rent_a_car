// What a company hands over and receives today, and what is still to be collected. Pure.

const owedKes = ({ total_kes: total, payments = [] }) => {
  const paid = payments
    .filter((payment) => payment.status === 'succeeded')
    .reduce((sum, payment) => sum + payment.amount_kes, 0)
  return Math.max(0, total - paid)
}

const handover = (booking, kind, at) => ({
  id: booking.id,
  kind,
  at,
  status: booking.status,
  car: booking.vehicle,
  renter: booking.customer?.full_name ?? null,
  owed_kes: owedKes(booking),
})

/** Today's pickups and returns in time order, with the money still owed on the cars being collected. */
export function dayOfHandovers({ pickups, returns }) {
  const handovers = [
    ...pickups.map((booking) => handover(booking, 'pickup', booking.start_at)),
    ...returns.map((booking) => handover(booking, 'return', booking.end_at)),
  ].sort((a, b) => new Date(a.at) - new Date(b.at))
  const toCollect = handovers
    .filter((entry) => entry.kind === 'pickup')
    .reduce((sum, entry) => sum + entry.owed_kes, 0)
  return { handovers, to_collect_kes: toCollect }
}
