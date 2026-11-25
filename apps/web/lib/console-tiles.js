import { CalendarArrowDown, CalendarArrowUp, CarFront, CircleCheck, KeyRound } from 'lucide-react'
import { copy } from '@/copy/en'
import { setupSteps } from '@/lib/setup-steps'

const text = copy.operatorConsole.today

const share = (part, whole) => (whole ? part / whole : 0)

function readiness(overview) {
  const steps = setupSteps(overview)
  const done = steps.filter((step) => step.isDone).length
  return {
    label: text.ready,
    value: `${done}/${steps.length}`,
    share: done / steps.length,
    note: done === steps.length ? text.readyDone : text.readyLeft(steps.length - done),
    icon: CircleCheck,
    tone: 'strong',
  }
}

/** The operator's headline figures, each with what it is a share of. */
export function consoleTiles(overview) {
  const {
    vehicles,
    vehicles_total: total,
    on_hire: onHire,
    vehicles_without_rate: unpriced,
  } = overview
  return [
    {
      label: text.vehicles,
      value: vehicles,
      share: share(vehicles, total),
      note: unpriced ? text.unpricedShort(unpriced) : text.ofFleet(total),
      icon: CarFront,
      tone: unpriced ? 'warm' : 'plain',
      href: '/console/fleet',
    },
    {
      label: text.onHire,
      value: onHire,
      share: share(onHire, vehicles),
      note: text.ofActive(vehicles),
      icon: KeyRound,
    },
    {
      label: text.pickups,
      value: overview.pickups_today,
      note: text.dueToday,
      icon: CalendarArrowUp,
    },
    {
      label: text.returns,
      value: overview.returns_today,
      note: text.dueToday,
      icon: CalendarArrowDown,
    },
    readiness(overview),
  ]
}
