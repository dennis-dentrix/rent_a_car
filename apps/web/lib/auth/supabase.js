import { createClient } from '@supabase/supabase-js'

// Supabase Auth, called from the web server only. Nothing is kept in the browser: the tokens are in cookies
// and every client here is made for one request and thrown away.
const clientOptions = { auth: { persistSession: false, autoRefreshToken: false } }

export const anonAuthClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    clientOptions,
  )

/**
 * A client acting as the signed-in person, for steps that need their session (listing or verifying a second
 * factor). Returns null when the tokens are no longer good.
 */
export async function signedInClient({ accessToken, refreshToken }) {
  const client = anonAuthClient()
  const { error } = await client.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  })
  return error ? null : client
}

/** The session the client now holds. A step that verifies a factor ends with a stronger one than it began with. */
export async function currentSession(client) {
  return (await client.auth.getSession()).data.session
}
