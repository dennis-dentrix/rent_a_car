'use client'

import { BellRing, CalendarCheck } from 'lucide-react'
import { useAlerts } from '@/components/AlertsProvider'
import IconButton from '@/components/IconButton'
import NavBadge from '@/components/NavBadge'
import { bookingsEntry } from '@/lib/bookings-entry'
import { useWho } from '@/lib/use-who'

/**
 * The bookings button in the top bar, for a renter and for a rental company. With something new it carries the count
 * and its icon rings.
 */
export default function BookingsBell() {
  const { who } = useWho()
  const alerts = useAlerts()
  const entry = bookingsEntry(who?.home)
  if (!entry) return null
  const Icon = alerts[entry.badge] ? BellRing : CalendarCheck
  return (
    <span className="relative inline-flex">
      <IconButton href={entry.href} label={entry.label}>
        <Icon size={20} aria-hidden="true" />
      </IconButton>
      <NavBadge name={entry.badge} className="pointer-events-none absolute -right-1 -top-1" />
    </span>
  )
}
