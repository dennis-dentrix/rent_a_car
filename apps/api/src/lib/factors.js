/**
 * Whether the person has set up an authenticator app. Supabase lists a person's factors on the user it returns when a
 * token is checked, so this costs no extra call. An unfinished setup (not yet verified) does not count.
 */
export const hasVerifiedFactor = (user) =>
  (user.factors ?? []).some((factor) => factor.status === 'verified')
