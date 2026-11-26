'use client'

import { useEffect } from 'react'
import { markReadAction } from '@/app/messages/actions'
import { ALERTS_CHANGED } from '@/lib/use-alert-poll'

const EVERY_MS = 20_000

/**
 * While a chat is on screen the server is told it has been read: on opening, on each new message, and often enough
 * after that no email is sent to someone who is looking at it.
 */
export default function MarkRead({ id, lastMessageAt }) {
  useEffect(() => {
    const mark = async () => {
      if (document.hidden) return
      await markReadAction(id)
      window.dispatchEvent(new Event(ALERTS_CHANGED))
    }
    mark()
    const timer = setInterval(mark, EVERY_MS)
    document.addEventListener('visibilitychange', mark)
    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', mark)
    }
  }, [id, lastMessageAt])
  return null
}
