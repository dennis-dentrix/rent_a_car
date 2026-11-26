import {
  CalendarCheck,
  CarFront,
  CircleCheck,
  CircleX,
  FileText,
  Hourglass,
  PackageCheck,
  Undo2,
  Ban,
} from 'lucide-react'

// Each booking status gets a tone and an icon, so it never relies on colour alone. The words come
// from copy.status. Keys follow BOOKING_STATUSES in @carvo/shared.
export const STATUS_BADGES = {
  quoted: { tone: 'neutral', icon: FileText },
  pending_payment: { tone: 'warning', icon: Hourglass },
  requested: { tone: 'warning', icon: Hourglass },
  declined: { tone: 'error', icon: CircleX },
  confirmed: { tone: 'success', icon: CircleCheck },
  ready: { tone: 'accent', icon: PackageCheck },
  active: { tone: 'accent', icon: CarFront },
  // TODO(human): choose the tone and icon for the three "finished" states below. They are neutral
  // placeholders now. Tones: neutral, accent, success, warning, error, info, verified.
  returned: { tone: 'neutral', icon: Undo2 },
  closed: { tone: 'neutral', icon: CalendarCheck },
  expired: { tone: 'neutral', icon: Ban },
  cancelled: { tone: 'error', icon: CircleX },
}
