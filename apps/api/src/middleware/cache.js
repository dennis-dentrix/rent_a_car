/**
 * Let Cloudflare and browsers keep a public answer for a while, for data that rarely changes (classes, locations).
 * The edge keeps it `seconds`, then serves the old copy for as long again while it fetches a new one.
 * Never put this on a price quote, availability for dates, a payment, or anything a signed-in user sees:
 * those must always come from the database. `skip(req)` turns it off for a request, for example one with dates.
 */
export const publicCache =
  (seconds, skip = () => false) =>
  (req, res, next) => {
    if (!skip(req)) {
      res.set(
        'Cache-Control',
        `public, max-age=60, s-maxage=${seconds}, stale-while-revalidate=${seconds}`,
      )
    }
    next()
  }
