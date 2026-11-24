import { Router } from 'express'
import {
  createAvatarUploadSchema,
  registerOperatorSchema,
  setAvatarSchema,
  updateProfileSchema,
} from '@carvo/shared'
import { authenticate, authenticateFirstStep } from '../middleware/auth.js'
import { handle } from '../middleware/respond.js'
import {
  createAvatarUpload,
  getMe,
  removeAvatar,
  setAvatar,
  updateMe,
} from '../services/accounts.js'
import { registerOperator } from '../services/operators.js'

// The signed-in person's own profile.
export const accountsRouter = Router()

// "Who am I" is the one answer a password-only session may have: it tells the website whether to ask for a code.
accountsRouter.get(
  '/',
  authenticateFirstStep,
  handle(async (req) => ({ data: await getMe(req.auth) })),
)

accountsRouter.use(authenticate)

accountsRouter.patch(
  '/',
  handle(async (req) => ({ data: await updateMe(req.auth, updateProfileSchema.parse(req.body)) })),
)

// A customer starts a rental company of their own. It waits for an admin's review before renters see it.
accountsRouter.post(
  '/operator',
  handle(async (req) => ({
    data: await registerOperator(req.auth.db, registerOperatorSchema.parse(req.body)),
    status: 201,
  })),
)

// The person's picture: ask for a link, send the file to it, then save it as the picture.
accountsRouter.post(
  '/avatar-upload',
  handle(async (req) => ({
    data: await createAvatarUpload(req.auth, createAvatarUploadSchema.parse(req.body)),
    status: 201,
  })),
)

accountsRouter.put(
  '/avatar',
  handle(async (req) => ({ data: await setAvatar(req.auth, setAvatarSchema.parse(req.body)) })),
)

accountsRouter.delete(
  '/avatar',
  handle(async (req) => ({ data: await removeAvatar(req.auth) })),
)
