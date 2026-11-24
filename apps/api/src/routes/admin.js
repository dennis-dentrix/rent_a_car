import { Router } from 'express'
import {
  createAgreementSchema,
  createOwnerSchema,
  createTrackerSchema,
  createVehicleSchema,
  inviteStaffSchema,
  listQuerySchema,
  updateStaffSchema,
  updateTrackerSchema,
  updateVehicleSchema,
} from '@rent-a-car/shared'
import { idParam, requireRoles } from '../middleware/auth.js'
import { handle } from '../middleware/respond.js'
import { adminDataRouter } from './admin-data.js'
import { adminOperatorsRouter } from './admin-operators.js'
import { adminPostsRouter } from './posts.js'
import { adminServicesRouter } from './admin-services.js'
import { createAgreement, createOwner, getOwner, listOwners } from '../services/owners.js'
import { inviteStaff, listStaff, updateStaff } from '../services/staff-accounts.js'
import { addTracker, updateTracker } from '../services/trackers.js'
import { createVehicle, updateVehicle } from '../services/vehicles.js'

// Admin only.
export const adminRouter = Router()
adminRouter.use(requireRoles('admin'))
adminRouter.param('id', idParam)
adminRouter.use(adminDataRouter)
adminRouter.use(adminServicesRouter)
adminRouter.use(adminPostsRouter)
adminRouter.use(adminOperatorsRouter)

adminRouter.post(
  '/vehicles',
  handle(async (req) => ({
    data: await createVehicle(req.auth.db, createVehicleSchema.parse(req.body)),
    status: 201,
  })),
)

adminRouter.patch(
  '/vehicles/:id',
  handle(async (req) => ({
    data: await updateVehicle(req.auth.db, req.params.id, updateVehicleSchema.parse(req.body)),
  })),
)

adminRouter.post(
  '/vehicles/:id/trackers',
  handle(async (req) => ({
    data: await addTracker(req.auth.db, req.params.id, createTrackerSchema.parse(req.body)),
    status: 201,
  })),
)

adminRouter.patch(
  '/trackers/:id',
  handle(async (req) => ({
    data: await updateTracker(req.auth.db, req.params.id, updateTrackerSchema.parse(req.body)),
  })),
)

adminRouter.post(
  '/vehicle-owners',
  handle(async (req) => ({
    data: await createOwner(req.auth.db, createOwnerSchema.parse(req.body)),
    status: 201,
  })),
)

adminRouter.get(
  '/vehicle-owners',
  handle((req) => listOwners(req.auth.db, listQuerySchema.parse(req.query))),
)

adminRouter.get(
  '/vehicle-owners/:id',
  handle(async (req) => ({ data: await getOwner(req.auth.db, req.params.id) })),
)

adminRouter.post(
  '/vehicle-owners/:id/agreements',
  handle(async (req) => ({
    data: await createAgreement(req.auth.db, req.params.id, createAgreementSchema.parse(req.body)),
    status: 201,
  })),
)

adminRouter.get(
  '/staff',
  handle((req) => listStaff(req.auth, listQuerySchema.parse(req.query))),
)

adminRouter.post(
  '/staff',
  handle(async (req) => ({
    data: await inviteStaff(req.auth, inviteStaffSchema.parse(req.body)),
    status: 201,
  })),
)

adminRouter.patch(
  '/staff/:id',
  handle(async (req) => ({
    data: await updateStaff(req.auth, req.params.id, updateStaffSchema.parse(req.body)),
  })),
)
