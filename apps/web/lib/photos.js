import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { EXAMPLE_PHOTO_FOLDER, PHOTO_FOLDER, mediaUrl } from '@/lib/media'

const EXTENSIONS = ['webp', 'jpg', 'jpeg', 'png']

function findInFolder(folder, slug) {
  const extension = EXTENSIONS.find((ext) =>
    existsSync(join(process.cwd(), 'public', folder, `${slug}.${ext}`)),
  )
  return extension ? `/${folder}/${slug}.${extension}` : null
}

// A file named after the car type's slug is picked up by name, so photos can be added by dropping a file in,
// before any image hosting exists. A real photo wins over an example.
function localPhoto(slug) {
  return findInFolder(PHOTO_FOLDER, slug) ?? findInFolder(EXAMPLE_PHOTO_FOLDER, slug)
}

/**
 * The photograph of a car type, or null (the page then says there is none). A photo recorded on the car type comes
 * first; then a file named after the car type, in `car-photos` (real) or `example-photos` (stand-in). Server only.
 */
export function classPhoto(item) {
  return mediaUrl(item.image_url, process.env.NEXT_PUBLIC_MEDIA_BASE_URL) ?? localPhoto(item.slug)
}
