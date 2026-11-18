import { Router } from 'express'
import {
  availabilityQuerySchema,
  classesQuerySchema,
  createEnquirySchema,
  quoteBodySchema,
} from '@rent-a-car/shared'
import { idParam } from '../middleware/auth.js'
import { handle } from '../middleware/respond.js'
import { createAnonClient } from '../lib/supabase.js'
import { availableCount, getClass, listClasses, listLocations } from '../services/catalogue.js'
import { createPublicEnquiry } from '../services/enquiries.js'
import { createQuote } from '../services/quotes.js'

// Public routes: no sign-in needed.
export const catalogueRouter = Router()
catalogueRouter.param('id', idParam)

catalogueRouter.get(
  '/classes',
  handle(async (req) => ({
    data: await listClasses(createAnonClient(), classesQuerySchema.parse(req.query)),
  })),
)

catalogueRouter.get(
  '/classes/:id',
  handle(async (req) => ({ data: await getClass(createAnonClient(), req.params.id) })),
)

catalogueRouter.get(
  '/locations',
  handle(async () => ({ data: await listLocations(createAnonClient()) })),
)

catalogueRouter.get(
  '/availability',
  handle(async (req) => {
    const { class_id, start_at, end_at } = availabilityQuerySchema.parse(req.query)
    const count = await availableCount(createAnonClient(), class_id, start_at, end_at)
    return { data: { available: count > 0, available_count: count } }
  }),
)

catalogueRouter.post(
  '/quotes',
  handle(async (req) => ({
    data: await createQuote(quoteBodySchema.parse(req.body)),
    status: 201,
  })),
)

catalogueRouter.post(
  '/enquiries',
  handle(async (req) => ({
    data: await createPublicEnquiry(createEnquirySchema.parse(req.body)),
    status: 201,
  })),
)
