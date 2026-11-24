import { Router } from 'express'
import { operatorsQuerySchema, reviewOperatorSchema } from '@rent-a-car/shared'
import { idParam } from '../middleware/auth.js'
import { handle } from '../middleware/respond.js'
import { getOperator, listOperators, reviewOperator } from '../services/operators.js'

// Admin only (the parent router checks the role and the second factor): the review of rental companies.
export const adminOperatorsRouter = Router()
adminOperatorsRouter.param('id', idParam)

adminOperatorsRouter.get(
  '/operators',
  handle((req) => listOperators(req.auth.db, operatorsQuerySchema.parse(req.query))),
)

adminOperatorsRouter.get(
  '/operators/:id',
  handle(async (req) => ({ data: await getOperator(req.auth.db, req.params.id) })),
)

adminOperatorsRouter.post(
  '/operators/:id/review',
  handle(async (req) => ({
    data: await reviewOperator(req.auth.db, req.params.id, reviewOperatorSchema.parse(req.body)),
  })),
)
