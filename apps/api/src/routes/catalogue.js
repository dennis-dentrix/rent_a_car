import { Router } from 'express'
import {
  availabilityQuerySchema,
  classesQuerySchema,
  createEnquirySchema,
  listQuerySchema,
  placeQuerySchema,
  quoteBodySchema,
  reportFingerprintSchema,
} from '@carvo/shared'
import { idParam } from '../middleware/auth.js'
import { publicCache } from '../middleware/cache.js'
import { handle } from '../middleware/respond.js'
import { createAnonClient } from '../lib/supabase.js'
import { autocompletePlaces } from '../lib/places.js'
import {
  availableCount,
  getClass,
  listClasses,
  listDisplayRates,
  listLocations,
} from '../services/catalogue.js'
import { createPublicEnquiry } from '../services/enquiries.js'
import { getPublicVehicle, listPublicVehicles } from '../services/public-vehicles.js'
import { verifySealedReport } from '../services/inspection-lists.js'
import { createQuote } from '../services/quotes.js'
import { listServices } from '../services/services.js'

// Public routes: no sign-in needed.
export const catalogueRouter = Router()
catalogueRouter.param('id', idParam)

// Cached at the edge: data that rarely changes. A list with dates carries live availability, so it is never cached.
const hasDates = (req) => Boolean(req.query.from || req.query.to)

// Real cars of approved companies. It carries a price, so it is never cached.
catalogueRouter.get(
  '/vehicles',
  handle((req) => listPublicVehicles(createAnonClient(), listQuerySchema.parse(req.query))),
)

catalogueRouter.get(
  '/vehicles/:id',
  handle(async (req) => ({ data: await getPublicVehicle(createAnonClient(), req.params.id) })),
)

// Whether a copy of an inspection report is one that was sealed here.
catalogueRouter.get(
  '/verify/inspections/:sha256',
  handle(async (req) => ({
    data: await verifySealedReport(reportFingerprintSchema.parse(req.params).sha256),
  })),
)

catalogueRouter.get(
  '/classes',
  publicCache(60, hasDates),
  handle(async (req) => ({
    data: await listClasses(createAnonClient(), classesQuerySchema.parse(req.query)),
  })),
)

catalogueRouter.get(
  '/classes/:id',
  publicCache(60),
  handle(async (req) => ({ data: await getClass(createAnonClient(), req.params.id) })),
)

// The list of services changes only when the business adds one.
catalogueRouter.get(
  '/services',
  publicCache(3600),
  handle(async () => ({ data: await listServices(createAnonClient()) })),
)

catalogueRouter.get(
  '/locations',
  publicCache(3600),
  handle(async () => ({ data: await listLocations(createAnonClient()) })),
)

// What a renter types is never the same twice, so this is not cached. Cloudflare rate-limits the path.
catalogueRouter.get(
  '/places/autocomplete',
  handle(async (req) => ({ data: await autocompletePlaces(placeQuerySchema.parse(req.query).q) })),
)

// Rates change rarely and feed display only (the quote fixes its own rate), so the edge may keep them.
catalogueRouter.get(
  '/exchange-rates',
  publicCache(3600),
  handle(async () => ({ data: await listDisplayRates(createAnonClient()) })),
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
