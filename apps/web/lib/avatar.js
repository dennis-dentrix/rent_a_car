import { mediaUrl } from '@/lib/media'

/** The public address of a person's picture, or null when they have none (or no media address is set). */
export const avatarUrl = (path) =>
  path ? mediaUrl(path, process.env.NEXT_PUBLIC_MEDIA_BASE_URL) : null

/** Up to two capital letters from a name, for the circle shown when there is no picture. */
export const initialsOf = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('')

/** Tells the header, which stays mounted from page to page, that the picture or the name changed. */
export const PROFILE_CHANGED = 'profile-changed'
