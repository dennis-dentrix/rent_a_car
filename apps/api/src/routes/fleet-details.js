import { createAgreementSchema, createTrackerSchema, updateTrackerSchema } from '@carvo/shared'
import { handle } from '../middleware/respond.js'
import { createAgreement } from '../services/owners.js'
import { addTracker, updateTracker } from '../services/trackers.js'

/**
 * The parts of a vehicle that hang off it: its trackers, and the agreement that ties it to an owner. The same for the
 * admin and for an operator, and Row Level Security decides whose vehicles each may touch.
 */
export function mountFleetDetails(router) {
  router.post(
    '/vehicles/:id/trackers',
    handle(async (req) => ({
      data: await addTracker(req.auth.db, req.params.id, createTrackerSchema.parse(req.body)),
      status: 201,
    })),
  )
  router.patch(
    '/trackers/:id',
    handle(async (req) => ({
      data: await updateTracker(req.auth.db, req.params.id, updateTrackerSchema.parse(req.body)),
    })),
  )
  router.post(
    '/vehicle-owners/:id/agreements',
    handle(async (req) => ({
      data: await createAgreement(
        req.auth.db,
        req.params.id,
        createAgreementSchema.parse(req.body),
      ),
      status: 201,
    })),
  )
}
