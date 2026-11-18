import { describe, expect, it } from 'vitest'
import { buildTimeline } from './booking-timeline.js'

const states = (timeline) => timeline.map((step) => `${step.label}:${step.state}`)

describe('buildTimeline', () => {
  it('shows the deposit as the current step while payment is pending', () => {
    expect(states(buildTimeline('pending_payment', []))).toEqual([
      'Quote:done',
      'Deposit paid:current',
      'Documents verified:upcoming',
      'Ready:upcoming',
      'Handover:upcoming',
      'Returned:upcoming',
    ])
  })

  it('completes documents and ready together when a booking is ready', () => {
    const timeline = buildTimeline('ready', [])
    expect(states(timeline).slice(0, 5)).toEqual([
      'Quote:done',
      'Deposit paid:done',
      'Documents verified:done',
      'Ready:done',
      'Handover:current',
    ])
  })

  it('marks every step done once the vehicle is returned', () => {
    expect(buildTimeline('returned', []).every((step) => step.state === 'done')).toBe(true)
  })

  it('attaches the date a step was reached from the status events', () => {
    const events = [{ to_status: 'confirmed', created_at: '2026-11-20T10:00:00Z' }]
    const deposit = buildTimeline('confirmed', events).find((step) => step.label === 'Deposit paid')
    expect(deposit.date).toBe('2026-11-20T10:00:00Z')
  })

  it('has no timeline for a cancelled or expired booking', () => {
    expect(buildTimeline('cancelled', [])).toEqual([])
    expect(buildTimeline('expired', [])).toEqual([])
  })
})
