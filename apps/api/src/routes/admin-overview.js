import { Router } from 'express'
import { listQuerySchema } from '@carvo/shared'
import { handle } from '../middleware/respond.js'
import { getOverview, listAudit } from '../services/admin-overview.js'
import { bookingOutcomes } from '../services/booking-journey.js'

// Admin only (the parent router checks the role).
export const adminOverviewRouter = Router()

adminOverviewRouter.get(
  '/overview',
  handle(async (req) => ({ data: await getOverview(req.auth) })),
)

adminOverviewRouter.get(
  '/booking-outcomes',
  handle(async (req) => ({ data: await bookingOutcomes(req.auth) })),
)

adminOverviewRouter.get(
  '/audit',
  handle((req) => listAudit(req.auth, listQuerySchema.parse(req.query))),
)
