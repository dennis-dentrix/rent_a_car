// What a file really is, from its first bytes. A browser can declare any type it likes, so the type a
// customer declares is only trusted once the stored file's signature agrees with it.
const SIGNATURES = [
  { contentType: 'image/jpeg', bytes: [0xff, 0xd8, 0xff] },
  { contentType: 'image/png', bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  // "%PDF-"
  { contentType: 'application/pdf', bytes: [0x25, 0x50, 0x44, 0x46, 0x2d] },
  // "RIFF", four bytes of size, then "WEBP".
  {
    contentType: 'image/webp',
    bytes: [0x52, 0x49, 0x46, 0x46],
    then: { at: 8, bytes: [0x57, 0x45, 0x42, 0x50] },
  },
]

/** How many leading bytes `detectContentType` needs. */
export const SNIFF_BYTES = 12

const matchesAt = (head, bytes, offset = 0) =>
  bytes.every((byte, index) => head[offset + index] === byte)

/** The content type the bytes announce, or null when they match none we accept. */
export function detectContentType(head) {
  const match = SIGNATURES.find(
    ({ bytes, then }) => matchesAt(head, bytes) && (!then || matchesAt(head, then.bytes, then.at)),
  )
  return match?.contentType ?? null
}
