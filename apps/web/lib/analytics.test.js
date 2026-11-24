import { describe, expect, it } from 'vitest'
import {
  cleanEvent,
  commonProperties,
  deviceFor,
  isTrackablePath,
  prepareEvent,
} from './analytics.js'

describe('analytics events', () => {
  it('sends only events that are in the dictionary', () => {
    expect(cleanEvent('booking_created', { booking_id: 'x' })).toBeNull()
    expect(cleanEvent('constructor')).toBeNull()
    expect(cleanEvent('class_viewed')).toEqual({ name: 'class_viewed', properties: {} })
  })

  it('drops any property the dictionary does not list for that event', () => {
    const event = cleanEvent('class_viewed', {
      class_id: 'c1',
      price_per_day_kes: 9000,
      email: 'a@b.co',
      place: 'Westlands, Nairobi',
    })
    expect(event.properties).toEqual({ class_id: 'c1', price_per_day_kes: 9000 })
  })

  it('drops empty and non-plain values', () => {
    const event = cleanEvent('search_submitted', {
      class_id: undefined,
      city_slug: '',
      duration_days: 3,
    })
    expect(event.properties).toEqual({ duration_days: 3 })
    expect(cleanEvent('class_viewed', { class_id: { id: 1 } }).properties).toEqual({})
  })
})

describe('the last guard before sending', () => {
  it("lets a listed event through and drops the library's own events", () => {
    expect(prepareEvent({ event: 'class_viewed', properties: {} })).toEqual({
      event: 'class_viewed',
      properties: {},
    })
    expect(prepareEvent({ event: '$opt_in' })).toBeNull()
    expect(prepareEvent({ event: '$pageleave' })).toBeNull()
    expect(prepareEvent(null)).toBeNull()
  })

  it('cuts the address at the path, so what the visitor typed never leaves', () => {
    const event = prepareEvent({
      event: 'search_submitted',
      properties: { $current_url: 'https://carvo.co.ke/cars?place=Westlands&start=2026-11-25#top' },
    })
    expect(event.properties.$current_url).toBe('https://carvo.co.ke/cars')
  })

  it('removes the referrer and the profile bags, and keeps the rest', () => {
    const event = prepareEvent({
      event: 'class_viewed',
      properties: {
        $referrer: 'https://www.google.com/search?q=private',
        $referring_domain: 'www.google.com',
        $set: { $browser: 'x' },
        $set_once: { $initial_current_url: 'https://carvo.co.ke/?a=b' },
        class_id: 'c1',
        device: 'phone',
      },
    })
    expect(event.properties).toEqual({ class_id: 'c1', device: 'phone' })
  })
})

describe('what is measured', () => {
  it('never measures the private areas, but does measure similar public addresses', () => {
    expect(isTrackablePath('/account')).toBe(false)
    expect(isTrackablePath('/account/bookings')).toBe(false)
    expect(isTrackablePath('/admin/documents')).toBe(false)
    expect(isTrackablePath('/auth/sign-up')).toBe(false)
    expect(isTrackablePath('/accounting-tips')).toBe(true)
    expect(isTrackablePath('/cars/executive-sedan')).toBe(true)
  })

  it('names the device from the window width', () => {
    expect(deviceFor(390)).toBe('phone')
    expect(deviceFor(768)).toBe('tablet')
    expect(deviceFor(1440)).toBe('desktop')
  })

  it('describes a visit without a name, contact detail, or query', () => {
    const properties = commonProperties({
      pathname: '/cars',
      width: 390,
      currency: 'KES',
      isSignedIn: false,
      source: 'direct',
    })
    expect(properties).toEqual({
      role: 'guest',
      device: 'phone',
      locale: 'en-KE',
      display_currency: 'KES',
      page_path: '/cars',
      source: 'direct',
    })
  })
})
