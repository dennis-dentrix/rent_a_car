// Analytics is opt-in (docs/analytics-events.md §11): nothing is measured until the visitor says yes, and the
// choice is remembered on the device, like the display currency.
export const CONSENT_COOKIE = 'analytics_consent'
export const CONSENT_VALUES = ['granted', 'denied']

// Six months, so a person who said no is not asked again at every visit, but is asked again before long.
const SIX_MONTHS_SECONDS = 182 * 24 * 60 * 60

export const isConsentValue = (value) => CONSENT_VALUES.includes(value)

/** The saved choice from a cookie string: 'granted', 'denied', or undefined when none has been made. */
export function readConsentCookie(cookieText = '') {
  const match = cookieText.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=([^;]*)`))
  return match && isConsentValue(match[1]) ? match[1] : undefined
}

/** The cookie text that remembers a choice. */
export const consentCookie = (value) =>
  `${CONSENT_COOKIE}=${value}; path=/; max-age=${SIX_MONTHS_SECONDS}; samesite=lax`

/** The cookie text that forgets the choice, so the question is asked again. */
export const clearedConsentCookie = () => `${CONSENT_COOKIE}=; path=/; max-age=0; samesite=lax`
