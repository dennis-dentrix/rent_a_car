import { Router } from 'express'
import { updateProfileSchema } from '@rent-a-car/shared'
import { authenticate } from '../middleware/auth.js'
import { handle } from '../middleware/respond.js'
import { getMe, updateMe } from '../services/accounts.js'

// The signed-in person's own profile.
export const accountsRouter = Router()
accountsRouter.use(authenticate)

accountsRouter.get(
  '/',
  handle(async (req) => ({ data: await getMe(req.auth) })),
)

accountsRouter.patch(
  '/',
  handle(async (req) => ({ data: await updateMe(req.auth, updateProfileSchema.parse(req.body)) })),
)
