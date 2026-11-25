import { Router } from 'express'
import { handle } from '../middleware/respond.js'
import { accountsRouter } from './accounts.js'
import { adminRouter } from './admin.js'
import { bookingsRouter } from './bookings.js'
import { catalogueRouter } from './catalogue.js'
import { documentsRouter, inspectionFilesRouter } from './documents.js'
import { myInspectionsRouter } from './inspection-signing.js'
import { internalRouter } from './internal.js'
import { operatorRouter } from './operator.js'
import { publicPostsRouter } from './posts.js'
import { staffRouter } from './staff.js'

export const router = Router()

router.get(
  '/health',
  handle(async () => ({ data: { status: 'ok' } })),
)
router.use(catalogueRouter)
router.use(publicPostsRouter)
router.use('/me', accountsRouter)
router.use('/renter', myInspectionsRouter)
router.use('/bookings', bookingsRouter)
router.use('/documents', documentsRouter)
router.use('/inspection-files', inspectionFilesRouter)
router.use('/staff', staffRouter)
router.use('/admin', adminRouter)
router.use('/operator', operatorRouter)
router.use('/internal', internalRouter)
