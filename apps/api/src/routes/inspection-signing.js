import { Router } from 'express'
import {
  createHandoverSchema,
  inspectionUploadsSchema,
  listQuerySchema,
  signInspectionSchema,
  signWithCodeSchema,
} from '@carvo/shared'
import { authenticate, idParam } from '../middleware/auth.js'
import { handle } from '../middleware/respond.js'
import { listCompanyInspections, listMyInspections } from '../services/inspection-lists.js'
import {
  getReport,
  getSealedPdfUrl,
  sendRenterCode,
  signAsCompany,
  signAsRenter,
  signWithCode,
} from '../services/inspection-signing.js'
import {
  createInspection,
  createInspectionUploads,
  listInspections,
} from '../services/inspections.js'

// What a signature carries besides itself: where it came from.
const evidence = (req) => ({ ip: req.ip, userAgent: req.get('user-agent') })
const data = (handler) => handle(async (req) => ({ data: await handler(req) }))

// Reading a report and its sealed copy is the same for the company and the renter.
function mountReading(router) {
  router.get(
    '/inspections/:id',
    data((req) => getReport(req.auth, req.params.id)),
  )
  router.get(
    '/inspections/:id/report',
    data((req) => getSealedPdfUrl(req.auth, req.params.id)),
  )
}

/** The company records a handover, signs it, and takes the renter's signature on its own screen. */
export function mountCompanyInspections(router) {
  router.get(
    '/inspections',
    handle((req) => listCompanyInspections(req.auth, listQuerySchema.parse(req.query))),
  )
  router.post(
    '/bookings/:id/inspection-uploads',
    data((req) =>
      createInspectionUploads(req.auth, req.params.id, inspectionUploadsSchema.parse(req.body)),
    ),
  )
  router.get(
    '/bookings/:id/inspections',
    data((req) => listInspections(req.auth, req.params.id)),
  )
  router.post(
    '/inspections',
    handle(async (req) => ({
      data: await createInspection(req.auth, createHandoverSchema.parse(req.body)),
      status: 201,
    })),
  )
  mountReading(router)
  router.post(
    '/inspections/:id/sign',
    data((req) =>
      signAsCompany(req.auth, req.params.id, signInspectionSchema.parse(req.body), evidence(req)),
    ),
  )
  router.post(
    '/inspections/:id/renter-code',
    data((req) => sendRenterCode(req.auth, req.params.id)),
  )
  router.post(
    '/inspections/:id/renter-sign',
    data((req) =>
      signWithCode(req.auth, req.params.id, signWithCodeSchema.parse(req.body), evidence(req)),
    ),
  )
}

/** The signed-in renter's own reports: read, sign, and download. */
export const myInspectionsRouter = Router()
myInspectionsRouter.use(authenticate)
myInspectionsRouter.param('id', idParam)
myInspectionsRouter.get(
  '/inspections',
  handle((req) => listMyInspections(req.auth, listQuerySchema.parse(req.query))),
)
mountReading(myInspectionsRouter)
myInspectionsRouter.post(
  '/inspections/:id/sign',
  data((req) =>
    signAsRenter(req.auth, req.params.id, signInspectionSchema.parse(req.body), evidence(req)),
  ),
)
