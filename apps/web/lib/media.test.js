import { describe, expect, it } from 'vitest'
import { isExamplePhoto, mediaUrl, remoteImagePatterns } from './media.js'

describe('mediaUrl', () => {
  it('uses a full address as it is, and joins a storage path to the base address', () => {
    expect(mediaUrl('https://cdn.example.com/a.jpg', undefined)).toBe(
      'https://cdn.example.com/a.jpg',
    )
    expect(mediaUrl('classes/sedan.jpg', 'https://media.example.com/')).toBe(
      'https://media.example.com/classes/sedan.jpg',
    )
    expect(mediaUrl('/classes/sedan.jpg', 'https://media.example.com')).toBe(
      'https://media.example.com/classes/sedan.jpg',
    )
  })

  it('gives nothing when there is no path, or a path but nowhere to find it', () => {
    expect(mediaUrl(null, 'https://media.example.com')).toBeNull()
    expect(mediaUrl('classes/sedan.jpg', undefined)).toBeNull()
  })
})

describe('remoteImagePatterns', () => {
  it('allows only the media host and its folder', () => {
    expect(remoteImagePatterns('https://media.example.com/cars')).toEqual([
      { protocol: 'https', hostname: 'media.example.com', pathname: '/cars/**' },
    ])
  })

  it('allows nothing when there is no address or it is malformed', () => {
    expect(remoteImagePatterns(undefined)).toEqual([])
    expect(remoteImagePatterns('not a url')).toEqual([])
  })
})

describe('isExamplePhoto', () => {
  it('marks the stand-in photos shipped with the site, not hosted photos', () => {
    expect(isExamplePhoto('/example-photos/minibus.jpg')).toBe(true)
    expect(isExamplePhoto('/car-photos/executive-sedan.webp')).toBe(false)
    expect(isExamplePhoto('https://media.example.com/classes/minibus.jpg')).toBe(false)
    expect(isExamplePhoto(null)).toBe(false)
  })
})
