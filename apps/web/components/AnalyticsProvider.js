'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { SIGNED_IN_HINT } from '@/lib/auth/cookies'
import {
  cleanEvent,
  commonProperties,
  isTrackablePath,
  prepareEvent,
  sourceFor,
} from '@/lib/analytics'
import { clearedConsentCookie, consentCookie, readConsentCookie } from '@/lib/consent'
import { readCurrencyCookie, DEFAULT_CURRENCY } from '@/lib/currency'

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY
// The project's own region: a key only works with the host of the region it was made in.
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'
// A placeholder such as the one in .env.example is not a key, so the site then asks for nothing and sends nothing.
const IS_CONFIGURED = Boolean(KEY?.startsWith('phc_'))

// Events only, by name (lib/analytics.js). Pages, clicks, recordings, surveys, flags, performance reports, and the
// visitor's address are all off, and `before_send` drops anything that is not a listed event and cuts addresses at the path: the dictionary in
// docs/analytics-events.md is what is measured, and nothing else.
const POSTHOG_OPTIONS = {
  api_host: HOST,
  autocapture: false,
  capture_pageview: false,
  capture_pageleave: false,
  disable_session_recording: true,
  disable_surveys: true,
  capture_performance: false,
  capture_dead_clicks: false,
  capture_exceptions: false,
  enable_heatmaps: false,
  rageclick: false,
  advanced_disable_flags: true,
  before_send: prepareEvent,
  person_profiles: 'identified_only',
  // Local storage only, so there is no cookie to scope across the domain and everything stored can be removed by key.
  persistence: 'localStorage',
  respect_dnt: true,
  ip: false,
  save_referrer: false,
  save_campaign_params: false,
}

const AnalyticsContext = createContext({
  isAvailable: false,
  consent: null,
  setConsent() {},
  track: () => false,
})

/** Measuring, and the visitor's choice about it. `track` does nothing without a yes, so callers never check. */
export const useAnalytics = () => useContext(AnalyticsContext)

/** The saved choice: null until the page has read it (so the first paint matches the server's), then 'unset' or a choice. */
function useConsent() {
  const [consent, setConsentState] = useState(null)
  useEffect(() => setConsentState(readConsentCookie(document.cookie) ?? 'unset'), [])
  const setConsent = useCallback((next) => {
    document.cookie = next === 'unset' ? clearedConsentCookie() : consentCookie(next)
    setConsentState(next)
  }, [])
  return [consent, setConsent]
}

// Everything the library keeps on the device starts with `ph_`. Taking a yes back removes it, so a withdrawal leaves
// no identifier behind. A browser that refuses storage has nothing to remove.
function forgetStoredData() {
  try {
    ;[localStorage, sessionStorage].forEach((store) => {
      Object.keys(store)
        .filter((key) => key.startsWith('ph_'))
        .forEach((key) => store.removeItem(key))
    })
  } catch {
    // Storage is blocked: nothing was kept.
  }
}

/** Loads PostHog on a yes and stops it on anything else. Returns the client once it is ready to take events. */
function usePostHog(consent) {
  const [client, setClient] = useState(null)
  useEffect(() => {
    if (!IS_CONFIGURED || consent !== 'granted') return undefined
    let isCurrent = true
    import('posthog-js').then(({ default: posthog }) => {
      if (!isCurrent) return
      if (!posthog.__loaded) posthog.init(KEY, POSTHOG_OPTIONS)
      // Without this the library sends an event of its own for the opt-in, which is not in the dictionary.
      posthog.opt_in_capturing({ captureEventName: false })
      setClient(posthog)
    })
    return () => {
      isCurrent = false
    }
  }, [consent])
  useEffect(() => {
    if (!client || consent === 'granted') return
    client.opt_out_capturing()
    client.reset()
    forgetStoredData()
    setClient(null)
  }, [client, consent])
  return client
}

const hostOf = (address) => {
  try {
    return new URL(address).host
  } catch {
    return ''
  }
}

// Read when an event is sent, so it describes the page the visitor is on now, never an earlier one.
function describeVisit() {
  const { pathname, search, host } = window.location
  return {
    pathname,
    width: window.innerWidth,
    currency: readCurrencyCookie(document.cookie) ?? DEFAULT_CURRENCY,
    isSignedIn: document.cookie.split('; ').includes(`${SIGNED_IN_HINT}=1`),
    source: sourceFor({
      utmSource: new URLSearchParams(search).get('utm_source') ?? '',
      referrerHost: hostOf(document.referrer),
      ownHost: host,
    }),
  }
}

export function AnalyticsProvider({ children }) {
  const [consent, setConsent] = useConsent()
  const client = usePostHog(consent)

  const track = useCallback(
    (name, properties) => {
      const event = cleanEvent(name, properties)
      if (!client || !event || !isTrackablePath(window.location.pathname)) return false
      client.capture(event.name, { ...commonProperties(describeVisit()), ...event.properties })
      return true
    },
    [client],
  )

  const value = useMemo(
    () => ({ isAvailable: IS_CONFIGURED, consent, setConsent, track }),
    [consent, setConsent, track],
  )
  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>
}

/** Fires one event when the page that holds it appears (once, even if the visitor says yes a moment later). */
export function TrackEvent({ name, properties }) {
  const { track } = useAnalytics()
  const latest = useRef(properties)
  const hasSent = useRef(false)
  latest.current = properties
  useEffect(() => {
    if (!hasSent.current) hasSent.current = track(name, latest.current)
  }, [track, name])
  return null
}
