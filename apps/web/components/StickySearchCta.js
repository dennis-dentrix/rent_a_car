'use client'

import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { useAnalytics } from '@/components/AnalyticsProvider'
import Button from '@/components/Button'
import { copy } from '@/copy/en'

/**
 * A floating "Find a car" button on phones, shown once the search card has scrolled out of view, so the
 * main action is always one tap away. `targetId` is the element that holds the search.
 */
export default function StickySearchCta({ targetId, label = copy.home.help.sticky }) {
  const [isVisible, setIsVisible] = useState(false)
  const { track } = useAnalytics()

  useEffect(() => {
    const target = document.getElementById(targetId)
    if (!target) return undefined
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0)
    })
    observer.observe(target)
    return () => observer.disconnect()
  }, [targetId])

  if (!isVisible) return null
  return (
    <div className="animate-rise fixed inset-x-4 bottom-[calc(theme(spacing.tabbar)+env(safe-area-inset-bottom)+12px)] z-stickyBar lg:hidden">
      <Button
        href={`#${targetId}`}
        isFullWidth
        className="shadow-2"
        onClick={() => track('sticky_bar_cta_clicked')}
      >
        <Search size={20} aria-hidden="true" />
        {label}
      </Button>
    </div>
  )
}
