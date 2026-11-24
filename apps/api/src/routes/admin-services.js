import { Router } from 'express'
import { setOperatorServicesSchema } from '@rent-a-car/shared'
import { idParam } from '../middleware/auth.js'
import { handle } from '../middleware/respond.js'
import { getOperatorServices, setOperatorServices } from '../services/services.js'

// Admin only (the parent router checks the role). Until operators have their own console, an admin
// records which services each rental company offers.
export const adminServicesRouter = Router()
adminServicesRouter.param('id', idParam)

adminServicesRouter.get(
  '/operators/:id/services',
  handle(async (req) => ({ data: await getOperatorServices(req.auth.db, req.params.id) })),
)

adminServicesRouter.put(
  '/operators/:id/services',
  handle(async (req) => {
    const { services } = setOperatorServicesSchema.parse(req.body)
    return { data: await setOperatorServices(req.auth.db, req.params.id, services) }
  }),
)
