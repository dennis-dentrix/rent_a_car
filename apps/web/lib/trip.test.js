import { describe, expect, it } from 'vitest'
import { tripTasks } from './trip.js'

const file = (type, status, at = '2027-01-01T00:00:00Z') => ({
  type,
  status,
  file_confirmed_at: at,
})
const states = (documents, agreement) =>
  tripTasks({ documents }, agreement).map((task) => task.state)

describe('what is left to do before pickup', () => {
  it('asks for both documents and the signature at the start', () => {
    expect(states([], { signature: null })).toEqual(['todo', 'todo', 'todo'])
  })

  it('follows the newest file that arrived', () => {
    const documents = [
      file('national_id', 'rejected'),
      file('national_id', 'uploaded'),
      file('driving_licence', 'uploaded', null),
    ]
    expect(states(documents, { signature: { signed_name: 'A' } })).toEqual([
      'checking',
      'todo',
      'done',
    ])
  })
})
