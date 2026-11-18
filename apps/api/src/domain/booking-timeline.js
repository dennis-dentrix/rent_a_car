// The customer-facing timeline (product pack section 19.1): six steps from quote to return.
export const TIMELINE_STEPS = [
  'Quote',
  'Deposit paid',
  'Documents verified',
  'Ready',
  'Handover',
  'Returned',
]

// How many steps are complete once a booking reaches each status.
const STEPS_DONE_BY_STATUS = {
  quoted: 0,
  pending_payment: 1,
  confirmed: 2,
  ready: 4,
  active: 5,
  returned: 6,
  closed: 6,
}

// The status that completes each step, used to find the date the step was reached.
const STATUS_THAT_COMPLETES = {
  'Deposit paid': 'confirmed',
  'Documents verified': 'ready',
  Ready: 'ready',
  Handover: 'active',
  Returned: 'returned',
}

const stateOf = (index, done) => {
  if (index < done) return 'done'
  return index === done ? 'current' : 'upcoming'
}

/**
 * Build the timeline for a booking.
 * A cancelled or expired booking has no further steps, so its timeline is empty.
 *
 * @param {string} status
 * @param {Array<{ to_status: string, created_at: string }>} events status events for the booking
 * @returns {Array<{ label: string, state: 'done'|'current'|'upcoming', date: string|null }>}
 */
export function buildTimeline(status, events) {
  const done = STEPS_DONE_BY_STATUS[status]
  if (done === undefined) return []
  const dateFor = (label) =>
    events.find((event) => event.to_status === STATUS_THAT_COMPLETES[label])?.created_at ?? null
  return TIMELINE_STEPS.map((label, index) => ({
    label,
    state: stateOf(index, done),
    date: stateOf(index, done) === 'done' ? dateFor(label) : null,
  }))
}
