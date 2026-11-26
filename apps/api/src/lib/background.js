// Work that carries on after the answer has gone. A long-running server needs nothing more; Cloudflare Workers must be
// told to wait for it, so the worker registers how.
let keepAlive = () => {}

export const onBackgroundWork = (register) => {
  keepAlive = register
}

export const runInBackground = (work) => keepAlive(work)
