'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import posthog from 'posthog-js'

const ToastContext = createContext(() => {})

/** Call `useToast()(message)` after an action succeeds. Errors use Alert, never a toast. */
export const useToast = () => useContext(ToastContext)

const DURATION_MS = 4000

function PostHogIdentity() {
  const pathname = usePathname()
  const identifiedId = useRef(null)

  useEffect(() => {
    const resetIdentifiedPerson = () => {
      if (posthog.get_distinct_id() === identifiedId.current) posthog.reset()
      identifiedId.current = null
    }
    let isCurrent = true
    fetch('/auth/session', { cache: 'no-store' })
      .then((response) => response.json())
      .then((person) => {
        if (!isCurrent) return
        if (!person.isSignedIn || !person.id) {
          resetIdentifiedPerson()
          return
        }
        if (identifiedId.current === person.id) return
        resetIdentifiedPerson()
        posthog.identify(person.id, {
          email: person.email,
          name: person.name,
          role: person.role,
        })
        identifiedId.current = person.id
      })
      .catch(() => {})
    return () => {
      isCurrent = false
    }
  }, [pathname])

  return null
}

export function ToastProvider({ children }) {
  const [message, setMessage] = useState(null)
  const timer = useRef(null)

  const show = useCallback((text) => {
    window.clearTimeout(timer.current)
    setMessage(text)
    timer.current = window.setTimeout(() => setMessage(null), DURATION_MS)
  }, [])

  return (
    <ToastContext.Provider value={show}>
      <PostHogIdentity />
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-24 z-toast flex justify-center px-4 lg:bottom-6"
      >
        {message && (
          <p className="glass animate-rise rounded-pill border border-separator px-5 py-3 text-callout font-medium shadow-2">
            {message}
          </p>
        )}
      </div>
    </ToastContext.Provider>
  )
}
