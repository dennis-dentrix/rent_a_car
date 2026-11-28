'use client'

import { attempt } from '@/lib/attempt'
import { useEffect } from 'react'
import { markBookingSeenAction } from '@/app/(site)/book/actions'
import { ALERTS_CHANGED } from '@/lib/use-alert-poll'

/** Opening a booking clears its news, and so does a new status that arrives while it is on screen. */
export default function MarkBookingSeen({ id, status }) {
  useEffect(() => {
    if (document.hidden) return
    attempt(() => markBookingSeenAction(id)).then(() =>
      window.dispatchEvent(new Event(ALERTS_CHANGED)),
    )
  }, [id, status])
  return null
}
