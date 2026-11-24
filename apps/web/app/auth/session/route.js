import { NextResponse } from 'next/server'
import { apiGet } from '@/lib/api'
import { homeFor } from '@/lib/auth/roles'
import { clearSession } from '@/lib/auth/cookies'
import { getTokens } from '@/lib/auth/session'
import { avatarUrl } from '@/lib/avatar'

// What the header needs to know about the person looking, so the public pages themselves stay the same for everyone and
// can be built ahead of time. Never kept by a cache: it is about one person.
const HEADERS = { 'Cache-Control': 'private, no-store' }

/** Nobody is signed in. The leftover cookies (and the flag the header reads) are cleared, so it stops saying "Account". */
function nobody() {
  const response = NextResponse.json({ isSignedIn: false }, { headers: HEADERS })
  clearSession(response.cookies)
  return response
}

export async function GET() {
  const tokens = await getTokens()
  if (!tokens) return nobody()
  const { data: profile, error } = await apiGet('/me', { token: tokens.accessToken })
  if (error === 'UNAUTHENTICATED') return nobody()
  // The API did not answer (it is down or slow): say nothing is known, and keep the session, which may be perfectly good.
  if (!profile) return NextResponse.json({ isSignedIn: false }, { headers: HEADERS })
  return NextResponse.json(
    {
      isSignedIn: true,
      name: profile.full_name,
      role: profile.role,
      avatar: avatarUrl(profile.avatar_path),
      home: homeFor(profile.role),
    },
    { headers: HEADERS },
  )
}
