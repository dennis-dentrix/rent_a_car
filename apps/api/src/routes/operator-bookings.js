import {
  answerRequestSchema,
  documentAccessQuerySchema,
  recordPaymentSchema,
  reviewDocumentSchema,
  staffBookingsQuerySchema,
  updateBookingStatusSchema,
} from '@carvo/shared'
import { idParam } from '../middleware/auth.js'
import { handle } from '../middleware/respond.js'
import {
  answerRequest,
  getCompanyBooking,
  listCompanyBookings,
  listRenterDocuments,
  moveBooking,
  openRenterDocument,
  recordPayment,
  reviewRenterDocument,
} from '../services/operator-bookings.js'

const data = (handler) => handle(async (req) => ({ data: await handler(req) }))
const ids = ({ params }) => ({ bookingId: params.id, documentId: params.documentId })

/** Running a hire, on the company's router (which has already checked the role). */
export function mountHireActions(router) {
  router.param('documentId', idParam)
  router.get(
    '/bookings',
    handle((req) => listCompanyBookings(req.auth, staffBookingsQuerySchema.parse(req.query))),
  )
  router.get(
    '/bookings/:id',
    data((req) => getCompanyBooking(req.auth, req.params.id)),
  )
  router.post(
    '/bookings/:id/answer',
    data((req) => answerRequest(req.auth, req.params.id, answerRequestSchema.parse(req.body))),
  )
  router.patch(
    '/bookings/:id/status',
    data((req) => moveBooking(req.auth, req.params.id, updateBookingStatusSchema.parse(req.body))),
  )
  router.post(
    '/bookings/:id/payments',
    handle(async (req) => ({
      data: await recordPayment(req.auth, req.params.id, recordPaymentSchema.parse(req.body)),
      status: 201,
    })),
  )
  router.get(
    '/bookings/:id/documents',
    data((req) => listRenterDocuments(req.auth, req.params.id)),
  )
  router.get(
    '/bookings/:id/documents/:documentId/url',
    data((req) =>
      openRenterDocument(req.auth, { ...ids(req), ...documentAccessQuerySchema.parse(req.query) }),
    ),
  )
  router.patch(
    '/bookings/:id/documents/:documentId',
    data((req) => reviewRenterDocument(req.auth, ids(req), reviewDocumentSchema.parse(req.body))),
  )
}
