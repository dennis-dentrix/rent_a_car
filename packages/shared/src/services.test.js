import { describe, expect, it } from 'vitest'
import { SERVICE_GROUPS, SERVICE_IDS, groupOfService } from './services.js'

describe('services', () => {
  it('gives every service one id and one group', () => {
    expect(new Set(SERVICE_IDS).size).toBe(SERVICE_IDS.length)
    SERVICE_IDS.forEach((id) => expect(groupOfService(id)).toBeDefined())
  })

  it('finds the group of a service, and ignores an unknown one', () => {
    expect(groupOfService('wedding_car')).toBe('events')
    expect(groupOfService('airport_transfer')).toBe('transfers')
    expect(groupOfService('submarine')).toBeUndefined()
    expect(Object.keys(SERVICE_GROUPS)).toEqual(['car_hire', 'transfers', 'events'])
  })
})
