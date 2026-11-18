import { createAgreementReadRouter } from './agreements.js'
import { Router } from 'express'
import {
  assignBookingSchema,
  createInspectionSchema,
  createStaffDocumentSchema,
  createStaffBookingSchema,
  createStaffEnquirySchema,
  documentAccessQuerySchema,
  documentQueueQuerySchema,
  inspectionUploadsSchema,
  listEnquiriesQuerySchema,
  listQuerySchema,
  reviewDocumentSchema,
  staffBookingsQuerySchema,
  updateBookingStatusSchema,
} from '@rent-a-car/shared'
import { idParam, requireRoles } from '../middleware/auth.js'
import { handle } from '../middleware/respond.js'
import {
  createStaffDocument,
  getStaffDocumentUrl,
  listDocumentQueue,
  reviewDocument,
} from '../services/documents.js'
import { createStaffEnquiry, listEnquiries } from '../services/enquiries.js'
import {
  createInspection,
  createInspectionUploads,
  listInspections,
} from '../services/inspections.js'
import {
  assignBooking,
  changeBookingStatus,
  createStaffBooking,
  getStaffBooking,
  listStaffBookings,
} from '../services/staff-bookings.js'
import { getVehicle, listVehicles } from '../services/vehicles.js'

// Staff and admin only.
export const staffRouter = Router()
staffRouter.use(requireRoles('staff', 'admin'))
staffRouter.param('id', idParam)

staffRouter.get(
  '/vehicles',
  handle((req) => listVehicles(req.auth.db, listQuerySchema.parse(req.query))),
)

staffRouter.get(
  '/vehicles/:id',
  handle(async (req) => ({ data: await getVehicle(req.auth.db, req.params.id) })),
)

staffRouter.post(
  '/inspections',
  handle(async (req) => ({
    data: await createInspection(req.auth, createInspectionSchema.parse(req.body)),
    status: 201,
  })),
)

staffRouter.get(
  '/bookings/:id/inspections',
  handle(async (req) => ({ data: await listInspections(req.auth, req.params.id) })),
)

staffRouter.get(
  '/enquiries',
  handle((req) => listEnquiries(req.auth, listEnquiriesQuerySchema.parse(req.query))),
)

staffRouter.post(
  '/enquiries',
  handle(async (req) => ({
    data: await createStaffEnquiry(req.auth, createStaffEnquirySchema.parse(req.body)),
    status: 201,
  })),
)

staffRouter.get(
  '/bookings',
  handle((req) => listStaffBookings(req.auth, staffBookingsQuerySchema.parse(req.query))),
)

staffRouter.post(
  '/bookings',
  handle(async (req) => ({
    data: await createStaffBooking(req.auth, createStaffBookingSchema.parse(req.body)),
    status: 201,
  })),
)

staffRouter.get(
  '/bookings/:id',
  handle(async (req) => ({ data: await getStaffBooking(req.auth, req.params.id) })),
)

staffRouter.patch(
  '/bookings/:id/status',
  handle(async (req) => ({
    data: await changeBookingStatus(
      req.auth,
      req.params.id,
      updateBookingStatusSchema.parse(req.body),
    ),
  })),
)

staffRouter.post(
  '/bookings/:id/assign',
  handle(async (req) => ({
    data: await assignBooking(req.auth, req.params.id, assignBookingSchema.parse(req.body)),
  })),
)

staffRouter.get(
  '/documents',
  handle((req) => listDocumentQueue(req.auth, documentQueueQuerySchema.parse(req.query))),
)

staffRouter.patch(
  '/documents/:id',
  handle(async (req) => ({
    data: await reviewDocument(req.auth, req.params.id, reviewDocumentSchema.parse(req.body)),
  })),
)

staffRouter.get(
  '/documents/:id/url',
  handle(async (req) => ({
    data: await getStaffDocumentUrl(
      req.auth,
      req.params.id,
      documentAccessQuerySchema.parse(req.query),
    ),
  })),
)

staffRouter.post(
  '/bookings/:id/documents',
  handle(async (req) => ({
    data: await createStaffDocument(
      req.auth,
      req.params.id,
      createStaffDocumentSchema.parse(req.body),
    ),
    status: 201,
  })),
)

staffRouter.post(
  '/bookings/:id/inspection-uploads',
  handle(async (req) => ({
    data: await createInspectionUploads(
      req.auth,
      req.params.id,
      inspectionUploadsSchema.parse(req.body),
    ),
    status: 201,
  })),
)

staffRouter.use('/bookings/:id', createAgreementReadRouter({ evidence: true }))
