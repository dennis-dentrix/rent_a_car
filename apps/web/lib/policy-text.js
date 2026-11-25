import { copy } from '@/copy/en'

const text = copy.policies

/** A policy as short sentences, one for each thing it sets. */
export const policyLines = (policy) =>
  [
    policy.min_hire_days && text.minDays(policy.min_hire_days),
    policy.min_age && text.minAge(policy.min_age),
    policy.cross_border && text.crossBorder[policy.cross_border],
    policy.daily_km_limit && text.kmLimit(policy.daily_km_limit),
    policy.fuel_policy && text.fuel[policy.fuel_policy],
    ...(policy.rules ?? []),
  ].filter(Boolean)
