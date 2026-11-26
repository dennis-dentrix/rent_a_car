import { blockDatesSchema, calendarQuerySchema } from '@carvo/shared'
import { handle } from '../middleware/respond.js'
import { blockDates, getCalendar, removeBlock } from '../services/operator-calendar.js'

/** The company's calendar, on its router (which has already checked the role and path ids). */
export function mountCalendar(router) {
  router.get(
    '/calendar',
    handle(async (req) => ({
      data: await getCalendar(
        req.auth,
        req.auth.operatorId,
        calendarQuerySchema.parse(req.query).from,
      ),
    })),
  )
  router.post(
    '/blocks',
    handle(async (req) => ({
      data: await blockDates(req.auth, blockDatesSchema.parse(req.body)),
      status: 201,
    })),
  )
  router.delete(
    '/blocks/:id',
    handle(async (req) => ({ data: await removeBlock(req.auth, req.params.id) })),
  )
}
