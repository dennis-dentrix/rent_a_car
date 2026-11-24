import { Router } from 'express'
import {
  cancelBookingSchema,
  changeDatesSchema,
  createBookingSchema,
  listBookingsQuerySchema,
} from '@carvo/shared'
import { authenticate, idParam } from '../middleware/auth.js'
import { handle } from '../middleware/respond.js'
import {
  cancelBooking,
  changeBookingDates,
  previewCancellation,
} from '../services/booking-changes.js'
import { createBooking, getBooking, listBookings } from '../services/bookings.js'
import { agreementSignRouter, createAgreementReadRouter } from './agreements.js'

// Customer routes: sign-in required. Row Level Security limits every read to the caller's rows.
export const bookingsRouter = Router()
bookingsRouter.use(authenticate)
bookingsRouter.param('id', idParam)

bookingsRouter.post(
  '/',
  handle(async (req) => ({
    data: await createBooking(req.auth, createBookingSchema.parse(req.body)),
    status: 201,
  })),
)

bookingsRouter.get(
  '/',
  handle((req) => listBookings(req.auth, listBookingsQuerySchema.parse(req.query))),
)

bookingsRouter.get(
  '/:id',
  handle(async (req) => ({ data: await getBooking(req.auth, req.params.id) })),
)

bookingsRouter.get(
  '/:id/cancellation',
  handle(async (req) => ({ data: await previewCancellation(req.auth, req.params.id) })),
)

bookingsRouter.post(
  '/:id/cancel',
  handle(async (req) => ({
    data: await cancelBooking(req.auth, req.params.id, cancelBookingSchema.parse(req.body)),
  })),
)

bookingsRouter.patch(
  '/:id',
  handle(async (req) => ({
    data: await changeBookingDates(req.auth, req.params.id, changeDatesSchema.parse(req.body)),
  })),
)

bookingsRouter.use('/:id', createAgreementReadRouter({ evidence: false }), agreementSignRouter)
