import { Router } from 'express'
import { createDocumentSchema, listQuerySchema } from '@rent-a-car/shared'
import { authenticate, idParam } from '../middleware/auth.js'
import { handle } from '../middleware/respond.js'
import {
  completeDocument,
  createDocument,
  getMyDocumentUrl,
  listMyDocuments,
} from '../services/documents.js'
import { getInspectionFileUrl } from '../services/inspections.js'

// A customer's own documents. Signed-in users only; Row Level Security limits every read to their own.
export const documentsRouter = Router()
documentsRouter.use(authenticate)
documentsRouter.param('id', idParam)

documentsRouter.post(
  '/',
  handle(async (req) => ({
    data: await createDocument(req.auth, createDocumentSchema.parse(req.body)),
    status: 201,
  })),
)

documentsRouter.get(
  '/',
  handle((req) => listMyDocuments(req.auth, listQuerySchema.parse(req.query))),
)

// Customer or staff, once the file is uploaded.
documentsRouter.post(
  '/:id/complete',
  handle(async (req) => ({ data: await completeDocument(req.auth, req.params.id) })),
)

documentsRouter.get(
  '/:id/url',
  handle(async (req) => ({ data: await getMyDocumentUrl(req.auth, req.params.id) })),
)

// Photos and documents from a rental's inspection: the customer who rented, and staff.
export const inspectionFilesRouter = Router()
inspectionFilesRouter.use(authenticate)
inspectionFilesRouter.param('id', idParam)

inspectionFilesRouter.get(
  '/:id/url',
  handle(async (req) => ({ data: await getInspectionFileUrl(req.auth, req.params.id) })),
)
