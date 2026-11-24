'use client'

import { useAnalytics } from '@/components/AnalyticsProvider'
import { copy } from '@/copy/en'

/**
 * The footer control that turns analytics off, and back on. The banner only offers Accept, so this is where a visitor
 * takes the counting back; it says what pressing it does. Nothing shows while the banner is still waiting for an answer.
 */
export default function ConsentLink({ className }) {
  const { isAvailable, consent, setConsent } = useAnalytics()
  if (!isAvailable || (consent !== 'granted' && consent !== 'denied')) return null
  const isOn = consent === 'granted'
  return (
    <button
      type="button"
      className={className}
      onClick={() => setConsent(isOn ? 'denied' : 'granted')}
    >
      {isOn ? copy.consent.turnOff : copy.consent.turnOn}
    </button>
  )
}
