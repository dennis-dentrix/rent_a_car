import { AppError } from '../lib/errors.js'

// The one transition table. The database keeps a copy in booking_status_transitions;
// domain/booking-status.test.js fails if the two differ.
export const TRANSITIONS = {
  quoted: ['pending_payment', 'expired'],
  pending_payment: ['requested', 'confirmed', 'cancelled', 'expired'],
  requested: ['confirmed', 'declined', 'cancelled', 'expired'],
  confirmed: ['ready', 'cancelled'],
  ready: ['active', 'cancelled'],
  active: ['returned'],
  returned: ['closed'],
  closed: [],
  cancelled: [],
  expired: [],
  declined: [],
}

export const BOOKING_STATUSES = Object.keys(TRANSITIONS)

export const canTransition = (from, to) => TRANSITIONS[from]?.includes(to) ?? false

export const nextStatuses = (from) => TRANSITIONS[from] ?? []

export function assertTransition(from, to) {
  if (!canTransition(from, to)) {
    throw new AppError('INVALID_STATUS_TRANSITION', { details: { from, to } })
  }
}

// Statuses that keep a vehicle unavailable. Mirrors the exclusion constraint on bookings.
export const HOLDING_STATUSES = ['pending_payment', 'confirmed', 'ready', 'active']
