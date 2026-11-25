'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const EVERY_MS = 20_000

/**
 * Reads the page again every 20 seconds while it is on screen, and once when the person comes back to it. Nothing runs
 * while the tab is hidden, so a phone in a pocket spends no data.
 */
export default function LivePoll() {
  const router = useRouter()
  useEffect(() => {
    const refresh = () => document.visibilityState === 'visible' && router.refresh()
    const timer = setInterval(refresh, EVERY_MS)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [router])
  return null
}
