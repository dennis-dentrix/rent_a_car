import { Router } from 'express'
import { updateSettingSchema } from '@carvo/shared'
import { idParam } from '../middleware/auth.js'
import { handle } from '../middleware/respond.js'
import {
  ADMIN_RESOURCES,
  listExchangeRates,
  listSettings,
  setExchangeRate,
  updateSetting,
} from '../services/admin-data.js'
import { mountResources } from './resource-routes.js'

// Admin only (the parent router checks the role). Everything here is the data the business is run on.
export const adminDataRouter = Router()
adminDataRouter.param('id', idParam)

mountResources(adminDataRouter, ADMIN_RESOURCES)

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
