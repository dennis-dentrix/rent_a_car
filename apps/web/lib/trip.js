import { CUSTOMER_DOCUMENT_TYPES } from '@carvo/shared'

const STATES = { uploaded: 'checking', verified: 'done', rejected: 'rejected' }

// The newest file that really arrived. One whose upload failed has no confirmation and counts for nothing.
const latest = (documents, type) =>
  documents.filter((entry) => entry.type === type && entry.file_confirmed_at).at(-1)

const documentTask = (documents, type) => {
  const found = latest(documents, type)
  return {
    key: type,
    state: found ? STATES[found.status] : 'todo',
    reason: found?.rejection_reason ?? null,
  }
}

/** What the renter still has to do before pickup, each with how far it has got. */
export const tripTasks = ({ documents }, agreement) => [
  ...CUSTOMER_DOCUMENT_TYPES.map((type) => documentTask(documents, type)),
  ...(agreement ? [{ key: 'agreement', state: agreement.signature ? 'done' : 'todo' }] : []),
]

/** Preparing for a hire only makes sense before the car is collected. */
export const isBeforePickup = (status) => ['confirmed', 'ready'].includes(status)
