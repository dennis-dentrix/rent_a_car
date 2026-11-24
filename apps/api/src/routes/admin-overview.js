import { Router } from 'express'
import { listQuerySchema } from '@rent-a-car/shared'
import { handle } from '../middleware/respond.js'
import { getOverview, listAudit } from '../services/admin-overview.js'

// Admin only (the parent router checks the role).
export const adminOverviewRouter = Router()

adminOverviewRouter.get(
  '/overview',
  handle(async (req) => ({ data: await getOverview(req.auth) })),
)

adminOverviewRouter.get(
  '/audit',
  handle((req) => listAudit(req.auth, listQuerySchema.parse(req.query))),
)
