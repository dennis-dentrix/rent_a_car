import { describe, expect, it } from 'vitest'
import { conversationTitle, isOwnMessage, withDayBreaks } from './messages.js'

const conversation = {
  renter_name: 'Renter',
  company_name: 'Company',
  car_name: 'Honda Fit 2019',
  start_at: null,
  end_at: null,
}

describe('a conversation from each side', () => {
  it('is headed by the other party and the car', () => {
    expect(conversationTitle(conversation, 'company')).toEqual({
      title: 'Renter',
      detail: 'Honda Fit 2019',
    })
    expect(conversationTitle(conversation, 'renter').title).toBe('Company')
  })

  it('knows which messages are its own', () => {
    expect(isOwnMessage({ is_from_company: true }, 'company')).toBe(true)
    expect(isOwnMessage({ is_from_company: true }, 'renter')).toBe(false)
  })
})

describe('days in a conversation', () => {
  // 20:30 and 21:30 UTC fall either side of midnight in Nairobi.
  const messages = [
    { id: 1, created_at: '2027-03-01T08:00:00Z' },
    { id: 2, created_at: '2027-03-01T20:30:00Z' },
    { id: 3, created_at: '2027-03-01T21:30:00Z' },
  ]

  it('names a day above its first message, by the Nairobi calendar', () => {
    expect(withDayBreaks(messages).map((message) => message.day)).toEqual([
      '1 March 2027',
      undefined,
      '2 March 2027',
    ])
  })
})
