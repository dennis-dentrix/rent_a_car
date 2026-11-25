'use client'

import TabBar from '@/components/TabBar'
import { copy } from '@/copy/en'
import { customerTabs } from '@/lib/nav'
import { useWho } from '@/lib/use-who'

/** The public site's tab bar. Its last tab depends on who is looking, so it is drawn in the browser. */
export default function CustomerTabBar() {
  const { who, hasHint } = useWho()
  return <TabBar items={customerTabs(who, hasHint)} label={copy.nav.main} />
}
