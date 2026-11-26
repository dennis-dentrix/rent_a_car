import { copy } from '@/copy/en'

const isSupported = () => typeof window !== 'undefined' && 'Notification' in window

/** 'unsupported', 'default' (never asked), 'granted', or 'denied'. */
export const deviceAlertState = () => (isSupported() ? Notification.permission : 'unsupported')

export const askForDeviceAlerts = () => Notification.requestPermission()

/** A notice from the device itself, for someone looking at another tab or app. Only with their permission. */
export function showDeviceAlert(kind) {
  if (deviceAlertState() !== 'granted' || !document.hidden) return
  try {
    new Notification(copy.alerts[kind], { tag: kind })
  } catch {
    // Some phone browsers allow this only from a service worker; the in-page notice and email still reach them.
  }
}
