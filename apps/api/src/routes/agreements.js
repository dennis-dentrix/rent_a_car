import { Router } from 'express'
import { signAgreementSchema } from '@rent-a-car/shared'
import { handle } from '../middleware/respond.js'
import { getAgreement, getAgreementPdf, signAgreement } from '../services/agreements.js'

// The rental agreement of a booking. Mounted under /bookings/:id for customers and /staff/bookings/:id for staff;
// the parent router has already checked sign-in and the role. Only the customer signs.

/** Read the agreement and get the PDF. Staff (`evidence: true`) also see who signed it and from where. */
export function createAgreementReadRouter({ evidence }) {
  const router = Router({ mergeParams: true })
  router.get(
    '/agreement',
    handle(async (req) => ({ data: await getAgreement(req.auth, req.params.id, { evidence }) })),
  )
  router.get('/agreement/pdf', async (req, res) => {
    const bytes = await getAgreementPdf(req.auth, req.params.id)
    res
      .type('application/pdf')
      .set('Content-Disposition', 'inline; filename="rental-agreement.pdf"')
      .set('Cache-Control', 'private, no-store')
      .send(Buffer.from(bytes))
  })
  return router
}

export const agreementSignRouter = Router({ mergeParams: true })

agreementSignRouter.post(
  '/agreement/sign',
  handle(async (req) => ({
    data: await signAgreement(req.auth, req.params.id, signAgreementSchema.parse(req.body), {
      ip: req.ip,
      userAgent: req.get('user-agent'),
    }),
    status: 201,
  })),
)
