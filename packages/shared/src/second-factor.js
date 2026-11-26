/**
 * Whether the authenticator code is paused for work on this computer: only when `PAUSE_SECOND_FACTOR` is switched on,
 * and never in production. `env` is the process environment of the app asking.
 */
export const isSecondFactorPaused = (env) =>
  env.PAUSE_SECOND_FACTOR === 'true' && env.NODE_ENV !== 'production'
