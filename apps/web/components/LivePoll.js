'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const USUAL_MS = 20_000

/**
 * Reads the page again every `everyMs` (20 seconds unless told otherwise) while it is on screen, and once when the person comes back to it. Nothing runs
 * while the tab is hidden, so a phone in a pocket spends no data.
 */
export default function LivePoll({ everyMs = USUAL_MS }) {
  const router = useRouter()
  useEffect(() => {
    const refresh = () => document.visibilityState === 'visible' && router.refresh()
    const timer = setInterval(refresh, everyMs)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [router, everyMs])
  return null
}
