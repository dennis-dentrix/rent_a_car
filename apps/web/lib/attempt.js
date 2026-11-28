import { unstable_rethrow as rethrowNavigation } from 'next/navigation'
import { copy } from '@/copy/en'

/**
 * Runs a call to the server that may not get through (no signal, a server that failed, a new version just released).
 * Resolves to its answer, or to `failed` instead of throwing, so the page stays and says what happened. A redirect or
 * "not found" is not a failure and carries on.
 */
export async function attempt(work, failed = { error: copy.errors.offline }) {
  try {
    return await work()
  } catch (error) {
    rethrowNavigation(error)
    return failed
  }
}
