import { createApp } from './app.js'
import { logger } from './lib/logger.js'

const port = Number(process.env.PORT ?? 4000)
const server = createApp().listen(port, () => logger.info('api_started', { port }))

// Finish in-flight requests before the container stops.
process.on('SIGTERM', () => server.close(() => process.exit(0)))
