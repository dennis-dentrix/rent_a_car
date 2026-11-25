import { describe, expect, it } from 'vitest'
import { policyLines } from './policy-text.js'

describe('a policy in words', () => {
  it('says only what the policy sets, with its own rules last', () => {
    const lines = policyLines({
      min_hire_days: 1,
      min_age: null,
      cross_border: 'not_allowed',
      rules: ['No smoking'],
    })
    expect(lines).toEqual(['At least 1 day', 'No travel outside Kenya', 'No smoking'])
  })
})
