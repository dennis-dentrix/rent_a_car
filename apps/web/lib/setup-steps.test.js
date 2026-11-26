import { describe, expect, it } from 'vitest'
import { setupSteps } from './setup-steps.js'

const overview = {
  company: { is_complete: false },
  vehicles_total: 0,
  vehicles_without_rate: 0,
  services: 0,
}

describe("a new company's checklist", () => {
  // Two steps lead to the same page, so the address cannot tell the steps apart.
  it('names each step differently', () => {
    const keys = setupSteps(overview).map((step) => step.key)
    expect(new Set(keys).size).toBe(keys.length)
    expect(keys).not.toContain(undefined)
  })
})
