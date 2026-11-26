import { Router } from 'express'
import {
  milestoneSchema,
  setOperatorServicesSchema,
  setPlaceServedSchema,
  updateCompanySchema,
} from '@carvo/shared'
import { idParam, requireRoles } from '../middleware/auth.js'
import { handle } from '../middleware/respond.js'
import { getJourney, markNoShow, recordMilestone } from '../services/booking-journey.js'
import { OPERATOR_RESOURCES } from '../services/operator-data.js'
import {
  getCompany,
  getOperatorOverview,
  listAirports,
  setAirportServed,
  updateCompany,
} from '../services/operator-console.js'
import { getOperatorServices, setOperatorServices } from '../services/services.js'
import { mountFleetDetails } from './fleet-details.js'
import { mountCompanyInspections } from './inspection-signing.js'
import { mountHireActions } from './operator-bookings.js'
import { mountCalendar } from './operator-calendar.js'
import { mountResources } from './resource-routes.js'

// A rental company's own area. Each call acts as the signed-in person, so Row Level Security shows and allows only
// that company's records; the router adds who they are and checks the shape of what was sent.
export const operatorRouter = Router()
operatorRouter.use(requireRoles('operator'))
operatorRouter.param('id', idParam)

const data = (handler) => handle(async (req) => ({ data: await handler(req) }))

operatorRouter.get(
  '/overview',
  data((req) => getOperatorOverview(req.auth, req.auth.operatorId)),
)
operatorRouter.get(
  '/company',
  data((req) => getCompany(req.auth, req.auth.operatorId)),
)
operatorRouter.patch(
  '/company',
  data((req) => updateCompany(req.auth, req.auth.operatorId, updateCompanySchema.parse(req.body))),
)

operatorRouter.get(
  '/services',
  data((req) => getOperatorServices(req.auth.db, req.auth.operatorId)),
)
operatorRouter.put(
  '/services',
  data((req) =>
    setOperatorServices(
      req.auth.db,
      req.auth.operatorId,
      setOperatorServicesSchema.parse(req.body).services,
    ),
  ),
)

operatorRouter.get(
  '/airports',
  data((req) => listAirports(req.auth, req.auth.operatorId)),
)
operatorRouter.put(
  '/airports/:id',
  data((req) =>
    setAirportServed(
      req.auth,
      req.auth.operatorId,
      req.params.id,
      setPlaceServedSchema.parse(req.body).is_served,
    ),
  ),
)

operatorRouter.get(
  '/bookings/:id/journey',
  data((req) => getJourney(req.auth, req.params.id)),
)
operatorRouter.post(
  '/bookings/:id/milestones',
  data((req) => recordMilestone(req.auth, req.params.id, milestoneSchema.parse(req.body).step)),
)
operatorRouter.post(
  '/bookings/:id/no-show',
  data((req) => markNoShow(req.auth, req.params.id)),
)

mountHireActions(operatorRouter)
mountCalendar(operatorRouter)
mountFleetDetails(operatorRouter)
mountCompanyInspections(operatorRouter)
mountResources(operatorRouter, OPERATOR_RESOURCES)
