'use client'

import { createContext, useCallback, useContext, useRef, useState } from 'react'

const ToastContext = createContext(() => {})

/** Call `useToast()(message)` after an action succeeds. Errors use Alert, never a toast. */
export const useToast = () => useContext(ToastContext)

const DURATION_MS = 4000

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
