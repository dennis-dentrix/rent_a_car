import { describe, expect, it } from 'vitest'
import { detectContentType } from './file-sniff.js'

const bytes = (...values) => Buffer.from(values)

describe('detectContentType', () => {
  it.each([
    ['a JPEG', bytes(0xff, 0xd8, 0xff, 0xe0, 0, 0x10), 'image/jpeg'],
    ['a PNG', bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0), 'image/png'],
    ['a PDF', Buffer.from('%PDF-1.7\n'), 'application/pdf'],
    ['a WebP picture', Buffer.from('RIFF\x24\x00\x00\x00WEBPVP8 '), 'image/webp'],
  ])('recognises %s', (_name, head, expected) => {
    expect(detectContentType(head)).toBe(expected)
  })

  it.each([
    ['a web page', Buffer.from('<html><script>alert(1)</script>')],
    ['a program', Buffer.from('MZ\x90\x00\x03')],
    ['plain text renamed to a picture', Buffer.alloc(2048, 'a')],
    ['a GIF', Buffer.from('GIF89a')],
    ['another RIFF file, such as a WAV sound', Buffer.from('RIFF\x24\x00\x00\x00WAVEfmt ')],
    ['an empty file', Buffer.alloc(0)],
  ])('refuses %s', (_name, head) => {
    expect(detectContentType(head)).toBeNull()
  })
})
