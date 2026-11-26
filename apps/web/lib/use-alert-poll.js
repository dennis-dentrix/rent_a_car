import { useEffect, useEffectEvent } from 'react'

/** Told when something changed here, so the counts are read again at once. */
export const ALERTS_CHANGED = 'alerts:changed'

const SEEN_MS = 10_000
const HIDDEN_MS = 30_000

// Null when the counts could not be read: the last ones stay on screen.
const readAlerts = () =>
  fetch('/alerts', { cache: 'no-store' })
    .then((response) => (response.ok ? response.json() : null))
    .catch(() => null)

/** Reads the counts while `isOn`: often on screen, less often in a hidden tab, and on return to it. */
export function useAlertPoll(isOn, onRead) {
  const received = useEffectEvent((alerts) => alerts && onRead(alerts))
  useEffect(() => {
    if (!isOn) return undefined
    let timer
    const look = async () => {
      clearTimeout(timer)
      received(await readAlerts())
      timer = setTimeout(look, document.hidden ? HIDDEN_MS : SEEN_MS)
    }
    const lookIfSeen = () => !document.hidden && look()
    look()
    document.addEventListener('visibilitychange', lookIfSeen)
    window.addEventListener(ALERTS_CHANGED, look)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', lookIfSeen)
      window.removeEventListener(ALERTS_CHANGED, look)
    }
  }, [isOn])
}
