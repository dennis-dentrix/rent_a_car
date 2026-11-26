// What a renter sees while they wait: the steps of a booking, which one it is at, and whose turn is next. Pure: the
// booking's status stays the rule, and the steps between statuses come from the company's milestones.

// Who acts to reach each step.
const ACTORS = {
  received: 'renter',
  confirmed: 'company',
  agreement_signed: 'renter',
  car_prepared: 'company',
  ready: 'company',
  on_the_way: 'company',
  active: 'renter',
  completed: 'renter',
}

const ENDED = ['cancelled', 'expired', 'declined']
const handoverStep = (handoverType) => (handoverType === 'delivery' ? 'on_the_way' : 'ready')

export const timelineSteps = (handoverType) => [
  'received',
  'confirmed',
  'agreement_signed',
  'car_prepared',
  handoverStep(handoverType),
  'active',
  'completed',
]

// When each step was reached, from the records that prove it.
function reachedTimes({ booking, events, milestones, signedAt }) {
  const status = (...names) => events.find((event) => names.includes(event.to_status))?.created_at
  const milestone = (step) => milestones.find((entry) => entry.step === step)?.created_at
  return {
    received: booking.created_at,
    confirmed: status('confirmed'),
    agreement_signed: signedAt,
    car_prepared: milestone('car_prepared'),
    ready: status('ready'),
    on_the_way: milestone('en_route'),
    active: status('active'),
    completed: status('returned', 'closed'),
  }
}

const stateOf = (index, current, last) => {
  if (index < current || current === last) return 'done'
  return index === current ? 'current' : 'upcoming'
}

/** How far a delivery has got: on its way, arrived, or not started. */
function delivery({ booking, milestones }) {
  if (booking.handover_type !== 'delivery') return null
  const has = (step) => milestones.some((entry) => entry.step === step)
  if (has('arrived')) return 'arrived'
  return has('en_route') ? 'en_route' : 'waiting'
}

/** The one thing the company can record next with a tap, or null. Status changes are made elsewhere. */
function companyAction({ booking, milestones }) {
  const has = (step) => milestones.some((entry) => entry.step === step)
  const isPreparing = ['confirmed', 'ready'].includes(booking.status)
  if (isPreparing && !has('car_prepared')) return 'car_prepared'
  if (booking.status !== 'ready' || booking.handover_type !== 'delivery') return null
  if (!has('en_route')) return 'en_route'
  return has('arrived') ? null : 'arrived'
}

const latest = (times) => times.filter(Boolean).sort((a, b) => new Date(b) - new Date(a))[0] ?? null

/**
 * The booking's journey. A step counts as passed when a later one has happened, so a missing record never leaves the
 * renter looking at an old step. A cancelled or expired booking has ended and has no steps.
 *
 * @param {{ booking: object, events: object[], milestones: object[], signedAt?: string }} records
 */
export function buildTimeline(records) {
  const { booking, events, milestones } = records
  const times = reachedTimes(records)
  const updatedAt = latest(
    [...events, ...milestones].map((entry) => entry.created_at).concat(times.received),
  )
  if (ENDED.includes(booking.status)) {
    return {
      ended: booking.status,
      steps: [],
      next: null,
      delivery: null,
      company_action: null,
      updated_at: updatedAt,
    }
  }
  const keys = timelineSteps(booking.handover_type)
  const current = keys.reduce((found, key, index) => (times[key] ? index : found), 0)
  const steps = keys.map((key, index) => ({
    key,
    state: stateOf(index, current, keys.length - 1),
    at: times[key] ?? null,
  }))
  const upcoming = steps.find((step) => step.state === 'upcoming')
  return {
    ended: null,
    steps,
    next: upcoming ? { key: upcoming.key, actor: ACTORS[upcoming.key] } : null,
    delivery: delivery(records),
    company_action: companyAction(records),
    updated_at: updatedAt,
  }
}
