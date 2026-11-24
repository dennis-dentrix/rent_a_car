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
  // What is asked for with a sign-in is about one person, so no browser, proxy, or edge may keep it. Public routes that
  // are meant to be cached (publicCache) are sent without a sign-in and set their own header.
  app.use((req, res, next) => {
    if (req.headers.authorization) res.set('Cache-Control', 'private, no-store')
    next()
  })
  app.use(express.json({ limit: '100kb' }))
  app.use('/api/v1', router)
  app.use(notFoundHandler)
  app.use(errorHandler)
  return app
}
