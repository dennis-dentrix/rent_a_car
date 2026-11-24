import { usePathname } from 'next/navigation'
import { useEffect, useState, useSyncExternalStore } from 'react'
import { PROFILE_CHANGED } from '@/lib/avatar'
import { SIGNED_IN_HINT } from '@/lib/auth/cookies'

const noSubscription = () => () => {}
const hasHint = () => document.cookie.split('; ').includes(`${SIGNED_IN_HINT}=1`)

// What the page says when the server answered "nobody", so the screen is drawn again without the stale flag.
const NOBODY = { isSignedIn: false }

/**
 * Who is looking, for the parts of a public page that differ for someone signed in (the header, a call to action). The
 * pages themselves are the same for everyone. A flag cookie says whether to ask at all; the server then answers with
 * the name, picture, and area, and clears the flag if the session turns out to be over. Returns the person, or null
 * for a visitor (and while the answer is on its way, so the first paint always matches the server's).
 */
export function useWho() {
  const pathname = usePathname()
  const isSignedIn = useSyncExternalStore(noSubscription, hasHint, () => false)
  const [answer, setAnswer] = useState(null)
  useEffect(() => {
    if (!isSignedIn) return undefined
    let isCurrent = true
    const load = () =>
      fetch('/auth/session', { cache: 'no-store' })
        .then((response) => response.json())
        .then((data) => isCurrent && setAnswer(data.isSignedIn ? data : NOBODY))
        .catch(() => {})
    load()
    window.addEventListener(PROFILE_CHANGED, load)
    return () => {
      isCurrent = false
      window.removeEventListener(PROFILE_CHANGED, load)
    }
  }, [isSignedIn, pathname])
  return { who: isSignedIn && answer?.isSignedIn ? answer : null, hasHint: isSignedIn }
}
