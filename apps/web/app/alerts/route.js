import { NextResponse } from 'next/server'
import { apiGet } from '@/lib/api'
import { getTokens } from '@/lib/auth/session'

// Asked every few seconds while the site is open. About one person, so no cache may keep it.
const HEADERS = { 'Cache-Control': 'private, no-store' }

export async function GET() {
  const tokens = await getTokens()
  if (!tokens) return NextResponse.json({}, { status: 401, headers: HEADERS })
  const { data } = await apiGet('/me/alerts', { token: tokens.accessToken, revalidate: 0 })
  return NextResponse.json(data ?? {}, { status: data ? 200 : 502, headers: HEADERS })
}
