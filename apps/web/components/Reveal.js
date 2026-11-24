'use client'

import { useEffect, useRef, useState } from 'react'
import { cx } from '@/lib/cx'

/**
 * Fades its content up as it scrolls into view. Content is visible in the server-rendered page and with
 * scripts off; only what starts below the fold is hidden after load, so nothing flashes. Reduced-motion
 * users get no movement (the global rule shortens the transition to nothing).
 */
export default function Reveal({ delay = 0, className, children }) {
  const ref = useRef(null)
  const [phase, setPhase] = useState('visible')

  useEffect(() => {
    const node = ref.current
    if (!node || node.getBoundingClientRect().top < window.innerHeight) return undefined
    setPhase('hidden')
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      setPhase('shown')
      observer.disconnect()
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cx(
        'transition-[opacity,transform] duration-slow ease-standard',
        phase === 'hidden' && 'translate-y-3 opacity-0',
        className,
      )}
    >
      {children}
    </div>
  )
}
