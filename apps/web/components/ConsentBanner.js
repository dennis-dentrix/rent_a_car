'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Button from '@/components/Button'
import { useAnalytics } from '@/components/AnalyticsProvider'
import { copy } from '@/copy/en'
import { isTrackablePath } from '@/lib/analytics'

const text = copy.consent

/**
 * Tells the visitor, once, at the bottom of the screen, how the site uses cookies and counts visits, and starts counting on
 * Accept (owner ruling, 25 November 2026: analytics is wanted on while the product is young, so there is no decline
 * button here; the footer link turns it off at any time). It appears only when analytics is set up, the visitor has
 * not accepted or turned it off, and the page is one that is measured: nothing is said inside the private areas.
 */
export default function ConsentBanner() {
  const { isAvailable, consent, setConsent } = useAnalytics()
  const pathname = usePathname()
  if (!isAvailable || consent !== 'unset' || !isTrackablePath(pathname)) return null
  return (
    <section
      aria-label={text.label}
      className="animate-rise fixed inset-x-4 bottom-[calc(theme(spacing.tabbar)+env(safe-area-inset-bottom)+12px)] z-sheet rounded-card border border-separator bg-surface p-4 shadow-2 md:left-auto md:max-w-sm lg:bottom-4"
    >
      <p className="text-footnote text-label-2">
        {text.body} {text.privacy.before}
        <Link href="/privacy" className="font-semibold text-label underline underline-offset-2">
          {text.privacy.link}
        </Link>
        {text.privacy.after}
      </p>
      <Button size="compact" isFullWidth className="mt-4" onClick={() => setConsent('granted')}>
        {text.accept}
      </Button>
    </section>
  )
}
