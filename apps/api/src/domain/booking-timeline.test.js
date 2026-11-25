import { describe, expect, it } from 'vitest'
import { buildTimeline } from './booking-timeline.js'

const at = (hour) => `2026-12-01T${String(hour).padStart(2, '0')}:00:00Z`
const journey = ({ status, handover = 'office', events = [], milestones = [], signedAt }) =>
  buildTimeline({
    booking: { status, handover_type: handover, created_at: at(1) },
    events: events.map(([to_status, hour]) => ({ to_status, created_at: at(hour) })),
    milestones: milestones.map(([step, hour]) => ({ step, created_at: at(hour) })),
    signedAt,
  })
const current = (timeline) => timeline.steps.find((step) => step.state === 'current')?.key

describe('the journey of a booking', () => {
  it('starts at received and waits for the company to confirm', () => {
    const timeline = journey({ status: 'pending_payment' })
    expect(current(timeline)).toBe('received')
    expect(timeline.next).toEqual({ key: 'confirmed', actor: 'company' })
  })

  it('asks the renter to sign once confirmed, and lets the company prepare the car', () => {
    const timeline = journey({ status: 'confirmed', events: [['confirmed', 2]] })
    expect(timeline.next).toEqual({ key: 'agreement_signed', actor: 'renter' })
    expect(timeline.company_action).toBe('car_prepared')
  })

  it('passes a step that a later one has overtaken, and dates the last change', () => {
    const timeline = journey({
      status: 'confirmed',
      events: [['confirmed', 2]],
      milestones: [['car_prepared', 5]],
    })
    expect(current(timeline)).toBe('car_prepared')
    expect(timeline.steps[2]).toMatchObject({ key: 'agreement_signed', state: 'done', at: null })
    expect(timeline.updated_at).toBe(at(5))
  })
})

describe('a delivery', () => {
  it('follows a delivery from on its way to arrived', () => {
    const events = [['ready', 3]]
    const waiting = journey({
      status: 'ready',
      handover: 'delivery',
      events,
      milestones: [['car_prepared', 3]],
    })
    expect([waiting.delivery, waiting.company_action]).toEqual(['waiting', 'en_route'])
    const moving = journey({
      status: 'ready',
      handover: 'delivery',
      events,
      milestones: [['en_route', 4]],
    })
    expect([current(moving), moving.delivery, moving.company_action]).toEqual([
      'on_the_way',
      'en_route',
      'car_prepared',
    ])
    const there = journey({
      status: 'ready',
      handover: 'delivery',
      events,
      milestones: [
        ['car_prepared', 3],
        ['en_route', 4],
        ['arrived', 5],
      ],
    })
    expect([there.delivery, there.company_action]).toEqual(['arrived', null])
  })
})

describe('the end of a booking', () => {
  it('marks every step done once the car is back', () => {
    const timeline = journey({ status: 'returned', events: [['returned', 9]] })
    expect(timeline.steps.every((step) => step.state === 'done')).toBe(true)
    expect(timeline.next).toBeNull()
  })

  it('has ended, with no steps, when cancelled or expired', () => {
    expect(journey({ status: 'cancelled' })).toMatchObject({ ended: 'cancelled', steps: [] })
    expect(journey({ status: 'expired' }).next).toBeNull()
  })
})
