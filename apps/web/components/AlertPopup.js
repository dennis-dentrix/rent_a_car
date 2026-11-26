'use client'

import { useEffect, useEffectEvent } from 'react'
import Link from 'next/link'
import { BellRing, X } from 'lucide-react'
import { copy } from '@/copy/en'

const text = copy.alerts
const SHOWN_MS = 12_000
const PAGES = {
  unread_messages: '/messages',
  waiting_requests: '',
  booking_updates: '/bookings',
}

/** The news that just arrived, at the top of the screen, with one tap to act on it. */
export default function AlertPopup({ news, onClose }) {
  const close = useEffectEvent(onClose)
  useEffect(() => {
    const timer = setTimeout(close, SHOWN_MS)
    return () => clearTimeout(timer)
  }, [])
  return (
    <div
      role="alert"
      className="pt-safe animate-rise fixed inset-x-3 top-3 z-toast mx-auto flex max-w-md items-center gap-3 rounded-panel border border-separator bg-surface p-3 shadow-2"
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-pill bg-primary text-on-primary">
        <BellRing size={20} aria-hidden="true" />
      </span>
      <Link href={`${news.home}${PAGES[news.kind]}`} onClick={onClose} className="min-w-0 flex-1">
        <span className="block text-headline">{text[news.kind]}</span>
        <span className="block text-footnote font-semibold text-primary">{text.open}</span>
      </Link>
      <button
        type="button"
        aria-label={text.close}
        onClick={onClose}
        className="flex min-h-touch min-w-touch items-center justify-center rounded-pill text-label-2"
      >
        <X size={18} aria-hidden="true" />
      </button>
    </div>
  )
}
