import { Router } from 'express'
import { listQuerySchema, updateSettingSchema } from '@rent-a-car/shared'
import { idParam } from '../middleware/auth.js'
import { handle } from '../middleware/respond.js'
import {
  ADMIN_RESOURCES,
  createResource,
  getResource,
  listExchangeRates,
  listResource,
  listSettings,
  setExchangeRate,
  updateResource,
  updateSetting,
} from '../services/admin-data.js'

// Admin only (the parent router checks the role). Everything here is the data the business is run on.
export const adminDataRouter = Router()
adminDataRouter.param('id', idParam)

/** List, read, create, and change one kind of record at /<path>. */
function mountResource(path, definition) {
  const route = `/${path}`
  adminDataRouter.get(
    route,
    handle((req) => listResource(req.auth.db, definition, listQuerySchema.parse(req.query))),
  )
  adminDataRouter.get(
    `${route}/:id`,
    handle(async (req) => ({ data: await getResource(req.auth.db, definition, req.params.id) })),
  )
  adminDataRouter.post(
    route,
    handle(async (req) => ({
      data: await createResource(req.auth.db, definition, definition.create.parse(req.body)),
      status: 201,
    })),
  )
  adminDataRouter.patch(
    `${route}/:id`,
    handle(async (req) => ({
      data: await updateResource(
        req.auth.db,
        definition,
        req.params.id,
        definition.update.parse(req.body),
      ),
    })),
  )
}

Object.entries(ADMIN_RESOURCES).forEach(([path, definition]) => mountResource(path, definition))

adminDataRouter.get(
  '/settings',
  handle(async (req) => ({ data: await listSettings(req.auth.db) })),
)

adminDataRouter.put(
  '/settings/:key',
  handle(async (req) => ({
    data: await updateSetting(req.auth, req.params.key, updateSettingSchema.parse(req.body).value),
  })),
)

adminDataRouter.get(
  '/exchange-rates',
  handle(async (req) => ({ data: await listExchangeRates(req.auth.db) })),
)

adminDataRouter.put(
  '/exchange-rates/:currency',
  handle(async (req) => ({
    data: await setExchangeRate(req.auth.db, req.params.currency, req.body),
  })),
)
