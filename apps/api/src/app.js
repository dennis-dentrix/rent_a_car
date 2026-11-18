import express from 'express'
import helmet from 'helmet'
import { errorHandler, notFoundHandler } from './middleware/respond.js'
import { router } from './routes/index.js'

/** The Express application. Kept apart from `server.js` so tests can call it without a port. */
export function createApp() {
  const app = express()
  app.disable('x-powered-by')
  // The app sits behind Cloudflare and Caddy, so the client address is in the forwarded header.
  app.set('trust proxy', true)
  app.use(helmet())
  app.use(express.json({ limit: '100kb' }))
  app.use('/api/v1', router)
  app.use(notFoundHandler)
  app.use(errorHandler)
  return app
}
