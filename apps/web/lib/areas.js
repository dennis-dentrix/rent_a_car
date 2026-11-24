import { copy } from '@/copy/en'

/** Where a kind of person has their own area besides their account, and what to call it. Renters have none. */
const AREAS = {
  admin: { href: '/admin', label: copy.auth.menu.admin, cta: copy.operators.join.openAdmin },
  operator: {
    href: '/console',
    label: copy.auth.menu.company,
    cta: copy.operators.join.openDashboard,
  },
}

export const areaFor = (role) => AREAS[role]
