import { httpServerHandler } from 'cloudflare:node'
import { createApp } from './app.js'
import { logger } from './lib/logger.js'

// The Express app served by Cloudflare Workers. `server.js` serves the same app on a port for local use
// and Docker. The Workers runtime has no real network port, so this one is internal and never exposed.
const PORT = 8080
createApp().listen(PORT)
const api = httpServerHandler({ port: PORT })

const SCHEDULED_JOBS = ['expire-holds', 'send-notifications']

// A job is a POST to the app's own protected route, not a direct function call, so the job-secret check
// and the response envelope are the same as for any other caller.
async function runJob(job, env, ctx) {
  const request = new Request(`https://internal/api/v1/internal/jobs/${job}`, {
    method: 'POST',
    headers: { 'x-job-secret': env.INTERNAL_JOB_SECRET },
  })
  const response = await api.fetch(request, env, ctx)
  // A failed job is logged and the next run tries again; nothing else waits on it.
  if (!response.ok) logger.error('scheduled_job_failed', { job, status: response.status })
}

export default {
  fetch: (request, env, ctx) => api.fetch(request, env, ctx),
  scheduled: (_controller, env, ctx) => {
    ctx.waitUntil(Promise.all(SCHEDULED_JOBS.map((job) => runJob(job, env, ctx))))
  },
}
