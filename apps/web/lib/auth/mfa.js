import { brand } from '@carvo/shared/brand'
import { signedInClient } from '@/lib/auth/supabase'

// The second factor for staff and admin: a code from an authenticator app (time-based, six digits).

/** The person's confirmed authenticator, or undefined when they have not set one up. */
export async function findVerifiedFactor(client) {
  const { data } = await client.auth.mfa.listFactors()
  return data?.totp?.[0]
}

/**
 * Starts setting up an authenticator: a QR picture and the same secret as text for typing in. An earlier setup that
 * was never finished is removed first, because Supabase keeps each one and refuses a repeated name.
 */
export async function startEnrol(tokens) {
  const client = await signedInClient(tokens)
  if (!client) return null
  const { data: factors } = await client.auth.mfa.listFactors()
  const unfinished = (factors?.all ?? []).filter(
    (f) => f.factor_type === 'totp' && f.status !== 'verified',
  )
  await Promise.all(unfinished.map((f) => client.auth.mfa.unenroll({ factorId: f.id })))
  const { data, error } = await client.auth.mfa.enroll({
    factorType: 'totp',
    issuer: brand.name,
    friendlyName: `${brand.name} ${Date.now()}`,
  })
  return error ? null : { factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret }
}

/** Checks a code against a factor. The client then holds the stronger session the right code earns. */
export async function verifyCode(client, { factorId, code }) {
  const { error } = await client.auth.mfa.challengeAndVerify({ factorId, code })
  return !error
}
