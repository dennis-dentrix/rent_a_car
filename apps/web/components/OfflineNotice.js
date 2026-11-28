'use client'

import { useSyncExternalStore } from 'react'
import { WifiOff } from 'lucide-react'
import { copy } from '@/copy/en'

const subscribe = (notify) => {
  window.addEventListener('online', notify)
  window.addEventListener('offline', notify)
  return () => {
    window.removeEventListener('online', notify)
    window.removeEventListener('offline', notify)
  }
}

/** Says so while the device has no connection, before anyone presses a button that cannot work. */
export default function OfflineNotice() {
  const isOnline = useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true,
  )
  if (isOnline) return null
  // Over whatever is on screen, without taking taps: the controls under it stay usable.
  return (
    <div className="pt-safe pointer-events-none fixed inset-x-0 top-2 z-toast flex justify-center px-3">
      {/* A solid layer under the tint, so the page's own words do not show through. */}
      <div role="status" className="overflow-hidden rounded-panel bg-surface shadow-2">
        <p className="flex items-center gap-2 bg-warning-bg px-4 py-2 text-footnote font-semibold text-warning">
          <WifiOff size={16} className="shrink-0" aria-hidden="true" />
          {copy.errors.banner}
        </p>
      </div>
    </div>
  )
}
