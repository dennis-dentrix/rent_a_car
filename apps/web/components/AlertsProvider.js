'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import AlertPopup from '@/components/AlertPopup'
import { NO_ALERTS, newArrivals, titleWithCount, totalAlerts } from '@/lib/alerts'
import { showDeviceAlert } from '@/lib/device-alerts'
import { useAlertPoll } from '@/lib/use-alert-poll'
import { useWho } from '@/lib/use-who'

const AlertsContext = createContext(NO_ALERTS)

/** What is waiting for the person: { unread_messages, waiting_requests }. */
export const useAlerts = () => useContext(AlertsContext)

// The browser tab says how many things wait, on every page.
function useCountInTitle(count) {
  const path = usePathname()
  useEffect(() => {
    document.title = titleWithCount(document.title, count)
  }, [count, path])
}

// Holds the counts, and when something new arrives announces it and reads the page in view again.
function useArrivals(who) {
  const router = useRouter()
  const [alerts, setAlerts] = useState(NO_ALERTS)
  const [news, setNews] = useState(null)
  const last = useRef(null)
  useAlertPoll(Boolean(who), (found) => {
    const [kind] = newArrivals(last.current, found).reverse()
    last.current = found
    setAlerts(found)
    if (!kind) return
    setNews({ kind, home: who.home, at: Date.now() })
    showDeviceAlert(kind)
    router.refresh()
  })
  return { alerts: who ? alerts : NO_ALERTS, news, dismiss: () => setNews(null) }
}

/** Watches for new messages and booking requests for whoever is signed in, anywhere on the site. */
export default function AlertsProvider({ children }) {
  const { who } = useWho()
  const { alerts, news, dismiss } = useArrivals(who)
  useCountInTitle(totalAlerts(alerts))
  return (
    <AlertsContext.Provider value={alerts}>
      {children}
      {news && <AlertPopup key={news.at} news={news} onClose={dismiss} />}
    </AlertsContext.Provider>
  )
}
