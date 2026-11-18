// How the sender treats an email that failed to send: how long to wait before the next try, and when to give up.

export const MAX_ATTEMPTS = 5

/**
 * Minutes to wait before trying again after `attempts` failed tries (1 for the first failure).
 * Returns null to stop trying; the notification is then marked failed and staff can see it.
 */
export function retryDelayMinutes(attempts) {
  // minutes for the first wait; each wait after that doubles (5, 10, 20, 40).
  if (attempts >= MAX_ATTEMPTS) return null
  return 5 * 2 ** (attempts - 1)
}
