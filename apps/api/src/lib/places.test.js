import { afterEach, describe, expect, it, vi } from 'vitest'
import { autocompletePlaces } from './places.js'

const answer = (body, ok = true) =>
  vi.fn().mockResolvedValue({ ok, status: ok ? 200 : 500, json: async () => body })

describe('autocompletePlaces', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  it('returns no places, and calls nothing, when no key is set', async () => {
    vi.stubEnv('GOOGLE_PLACES_API_KEY', '')
    const fetchMock = answer({})
    vi.stubGlobal('fetch', fetchMock)
    expect(await autocompletePlaces('Wes')).toEqual([])
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('maps predictions to an id, a name, and a detail line, in Kenya only', async () => {
    vi.stubEnv('GOOGLE_PLACES_API_KEY', 'key')
    const fetchMock = answer({
      suggestions: [
        {
          placePrediction: {
            placeId: 'p1',
            text: { text: 'Westlands, Nairobi, Kenya' },
            structuredFormat: {
              mainText: { text: 'Westlands' },
              secondaryText: { text: 'Nairobi' },
            },
          },
        },
        { queryPrediction: { text: { text: 'westlands hotels' } } },
      ],
    })
    vi.stubGlobal('fetch', fetchMock)
    expect(await autocompletePlaces('Wes')).toEqual([
      { id: 'p1', label: 'Westlands', detail: 'Nairobi' },
    ])
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).includedRegionCodes).toEqual(['ke'])
  })
})

describe('autocompletePlaces when Google fails', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  it('gives an empty list', async () => {
    vi.stubEnv('GOOGLE_PLACES_API_KEY', 'key')
    vi.stubGlobal('fetch', answer({}, false))
    expect(await autocompletePlaces('Wes')).toEqual([])
  })
})
