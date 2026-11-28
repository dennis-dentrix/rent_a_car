/**
 * The address of a stored image. A full address is used as it is. A storage path ("classes/sedan.jpg") is joined to
 * the media base address when one is set (the public address of wherever photos are kept), and is otherwise
 * unusable, so it gives null and the page says there is no photo.
 */
export function mediaUrl(path, baseUrl) {
  if (!path) return null
  if (/^https?:\/\//i.test(path)) return path
  if (!baseUrl) return null
  return `${baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`
}

/** The remote hosts next/image may load from: the media base address, when it is set and well formed. */
export function remoteImagePatterns(baseUrl) {
  if (!baseUrl) return []
  try {
    const { protocol, hostname, port, pathname } = new URL(baseUrl)
    return [
      {
        protocol: protocol.replace(':', ''),
        hostname,
        ...(port ? { port } : {}),
        pathname: `${pathname.replace(/\/+$/, '')}/**`,
      },
    ]
  } catch {
    return []
  }
}

/** Photos of real cars that ship with the site live in the first folder; stand-ins showing a typical car of the type, in the second. */
export const PHOTO_FOLDER = 'car-photos'
export const EXAMPLE_PHOTO_FOLDER = 'example-photos'

export function isExamplePhoto(src) {
  return Boolean(src) && src.startsWith(`/${EXAMPLE_PHOTO_FOLDER}/`)
}
