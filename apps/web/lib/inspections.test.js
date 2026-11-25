import { orderedChecks } from '@carvo/shared'
import { describe, expect, it } from 'vitest'
import { buildReport, fitWithin, reportStatus } from './inspections.js'
import { formDataFrom } from './form-data.js'

describe('where a report stands', () => {
  it('asks for the company first, then the renter, until it is sealed', () => {
    expect(reportStatus({ signed_by: [], sealed_at: null }).key).toBe('company')
    expect(reportStatus({ signed_by: ['renter'], sealed_at: null }).key).toBe('company')
    expect(reportStatus({ signed_by: ['operator'], sealed_at: null }).key).toBe('renter')
    expect(reportStatus({ signed_by: ['operator', 'renter'], sealed_at: 'x' }).key).toBe('sealed')
  })
})

describe('the checks of a saved report', () => {
  it('come back in the order they are asked, whatever order they were stored in', () => {
    const stored = { tyres: 'ok', extra: 'ok', bodywork: 'issue' }
    expect(orderedChecks(stored).map(([check]) => check)).toEqual(['bodywork', 'tyres', 'extra'])
  })
})

describe('what the inspection form sends', () => {
  it('turns the readings and checks into a report, leaving out empty notes', () => {
    const body = buildReport(
      formDataFrom({
        fuel_level: 'half',
        mileage_km: '120',
        check_tyres: 'issue',
        condition_notes: ' ',
      }),
      { bookingId: 'b1', type: 'return', files: [] },
    )
    expect(body).toMatchObject({ mileage_km: 120, damage_noted: false, type: 'return' })
    expect(body.checklist.tyres).toBe('issue')
    expect(body).not.toHaveProperty('condition_notes')
  })

  it('shrinks a large photo in proportion and leaves a small one alone', () => {
    expect(fitWithin({ width: 4000, height: 3000 }, 1600)).toEqual({ width: 1600, height: 1200 })
    expect(fitWithin({ width: 800, height: 600 }, 1600)).toEqual({ width: 800, height: 600 })
  })
})
