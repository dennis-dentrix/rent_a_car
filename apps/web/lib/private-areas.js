// The parts of the site that belong to one person or to staff. Search engines are kept out of them
// (app/robots.js), and analytics never measures them (lib/analytics.js): one list, so the two cannot drift apart.
export const PRIVATE_AREAS = [
  '/account',
  '/settings',
  '/book',
  '/quote',
  '/console',
  '/admin',
  '/auth',
  '/dev',
  '/api',
]

/** True when the address is one of the private areas or inside one. */
export const isPrivatePath = (pathname) =>
  PRIVATE_AREAS.some((area) => pathname === area || pathname.startsWith(`${area}/`))
