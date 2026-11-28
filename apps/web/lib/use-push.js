import { useTransition } from 'react'
import { useRouter } from 'next/navigation'

/** Goes to another address and says so while the page is on its way: [isGoing, push]. */
export function usePush() {
  const router = useRouter()
  const [isGoing, startGoing] = useTransition()
  const push = (href, options) => startGoing(() => router.push(href, options))
  return [isGoing, push]
}
