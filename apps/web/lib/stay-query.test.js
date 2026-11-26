import { describe, expect, it } from 'vitest'
import { carriedChoices, stayRequest } from './stay-query.js'

const dates = { start: '2027-03-01', end: '2027-03-04' }

describe('the stay in a page address', () => {
  it('asks the API for the dates in Nairobi time, with a chauffeur only when chosen', () => {
    expect(stayRequest(dates)).toEqual({
      from: '2027-03-01T08:00:00+03:00',
      to: '2027-03-04T08:00:00+03:00',
    })
    expect(stayRequest({ ...dates, service: 'chauffeur_driven' }).with_chauffeur).toBe('true')
  })

  it('asks for nothing when the dates are missing or the wrong way round', () => {
    expect(stayRequest({ start: '2027-03-04', end: '2027-03-01' })).toEqual({})
    expect(stayRequest({ start: 'soon' })).toEqual({})
  })

  it('carries the search choices on and drops the filters', () => {
    expect(carriedChoices({ ...dates, pickup: 'JKIA', gear: 'manual' })).toMatchObject({
      ...dates,
      pickup: 'JKIA',
    })
    expect(carriedChoices({ gear: 'manual' })).not.toHaveProperty('gear')
  })
})
