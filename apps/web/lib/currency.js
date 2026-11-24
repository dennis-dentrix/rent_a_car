// Display currencies (docs/CLAUDE.md §3): KES in Kenya, USD elsewhere, switchable, remembered on the
// device. This changes what is shown, never what is charged: a quote fixes its own rate.
export const CURRENCY_COOKIE = 'currency'
export const DISPLAY_CURRENCIES = ['KES', 'USD']
export const DEFAULT_CURRENCY = 'KES'

const ONE_YEAR_SECONDS = 365 * 24 * 60 * 60

/** Kenya, and any visitor whose country is unknown, starts on KES; everyone else on USD. */
export const defaultCurrencyForCountry = (country) =>
  !country || country.toUpperCase() === 'KE' ? 'KES' : 'USD'

export const isDisplayCurrency = (value) => DISPLAY_CURRENCIES.includes(value)

/** The saved currency from a cookie string, or undefined. */
export function readCurrencyCookie(cookieText = '') {
  const match = cookieText.match(new RegExp(`(?:^|; )${CURRENCY_COOKIE}=([^;]*)`))
  return match && isDisplayCurrency(match[1]) ? match[1] : undefined
}

/** The Set-Cookie text that remembers a currency for a year. */
export const currencyCookie = (currency) =>
  `${CURRENCY_COOKIE}=${currency}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax`
