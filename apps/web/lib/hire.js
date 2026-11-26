// The company's one next move from each status. Confirming happens when the renter books.
const NEXT = { confirmed: 'ready', ready: 'active', active: 'returned', returned: 'closed' }
const CANCELLABLE = ['confirmed', 'ready']

export const nextStep = (status) => NEXT[status] ?? null
export const canCancel = (status) => CANCELLABLE.includes(status)
/** The renter's files are open to the company only while the hire is ahead or under way. */
export const showsDocuments = (status) => ['confirmed', 'ready', 'active'].includes(status)

/** What has been received, and what is still owed, from a booking's payments. */
export function paymentTotals({ total_kes: total, payments }) {
  const paid = payments
    .filter((payment) => payment.status === 'succeeded')
    .reduce((sum, payment) => sum + payment.amount_kes, 0)
  return { paid, owed: Math.max(0, total - paid) }
}
