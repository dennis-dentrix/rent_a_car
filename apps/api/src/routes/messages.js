import { Router } from 'express'
import { listQuerySchema, replySchema, startConversationSchema } from '@carvo/shared'
import { authenticate, idParam } from '../middleware/auth.js'
import { handle } from '../middleware/respond.js'
import {
  getConversation,
  listConversations,
  markRead,
  replyTo,
  startConversation,
} from '../services/messages.js'

// For renters and rental companies alike: sign-in required, and Row Level Security keeps each to their own.
export const messagesRouter = Router()
messagesRouter.use(authenticate)
messagesRouter.param('id', idParam)

messagesRouter.get(
  '/',
  handle((req) => listConversations(req.auth, listQuerySchema.parse(req.query))),
)
messagesRouter.post(
  '/',
  handle(async (req) => ({
    data: await startConversation(req.auth, startConversationSchema.parse(req.body)),
    status: 201,
  })),
)
messagesRouter.get(
  '/:id',
  handle(async (req) => ({ data: await getConversation(req.auth, req.params.id) })),
)
messagesRouter.post(
  '/:id/read',
  handle(async (req) => ({ data: await markRead(req.auth, req.params.id) })),
)
messagesRouter.post(
  '/:id',
  handle(async (req) => ({
    data: await replyTo(req.auth, req.params.id, replySchema.parse(req.body)),
    status: 201,
  })),
)
