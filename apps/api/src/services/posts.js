import { randomUUID } from 'node:crypto'
import { publishProblems, readingMinutes } from '@carvo/shared'
import { AppError, fieldError } from '../lib/errors.js'
import { listPage } from '../lib/pagination.js'
import { assertUploaded, blogImageKey, createUploadUrl, removeStoredFiles } from '../lib/storage.js'
import { unwrap } from '../lib/supabase.js'
import { findOne, insertOne, updateOne } from './records.js'

const PUBLIC_LIMIT = 100
const IMAGE_COLUMNS =
  'id, post_id, storage_path, content_type, size_bytes, width, height, alt_text, caption'
const ARTICLE_COLUMNS =
  'id, slug, keyword, title, description, intro, sections, faq, related, cover_image_id, status, ' +
  'published_at, created_at, updated_at'
const LIST_COLUMNS = 'id, slug, title, status, published_at, created_at, updated_at'
// A card shows reading time, which needs the body; the body itself is not sent.
const CARD_COLUMNS =
  'id, slug, title, description, intro, sections, cover_image_id, published_at, updated_at'

const byId = (rows) => new Map(rows.map((row) => [row.id, row]))

/** Images by id, in one query however many are asked for. */
async function imagesById(db, ids) {
  const wanted = [...new Set(ids.filter(Boolean))]
  if (wanted.length === 0) return new Map()
  return byId(unwrap(await db.from('post_images').select(IMAGE_COLUMNS).in('id', wanted)))
}

const postImages = async (db, postId) =>
  unwrap(
    await db
      .from('post_images')
      .select(IMAGE_COLUMNS)
      .eq('post_id', postId)
      .order('created_at', { ascending: false })
      .order('id', { ascending: false }),
  )

/** The section images a reader sees are the post's own, looked up from the ones already fetched. */
function withImages(post, images) {
  const known = byId(images)
  return {
    ...post,
    cover: known.get(post.cover_image_id) ?? null,
    sections: post.sections.map(({ image_id: imageId, ...section }) => ({
      ...section,
      image: known.get(imageId) ?? null,
    })),
  }
}

const toCard = ({ intro, sections, cover_image_id: coverId, ...post }, covers) => ({
  ...post,
  reading_minutes: readingMinutes({ intro, sections }),
  cover: covers.get(coverId) ?? null,
})

/** Published posts, newest first, as cards. Covers are fetched together, not one by one. */
export async function listPublicPosts(db) {
  const posts = unwrap(
    await db
      .from('posts')
      .select(CARD_COLUMNS)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(PUBLIC_LIMIT),
  )
  const covers = await imagesById(
    db,
    posts.map((post) => post.cover_image_id),
  )
  return posts.map((post) => toCard(post, covers))
}

/** One published post with its images. A draft is invisible here: Row Level Security hides it from the public. */
export async function getPublicPost(db, slug) {
  const post = await findOne(db, 'posts', ARTICLE_COLUMNS, slug, 'slug')
  return withImages(post, await postImages(db, post.id))
}

export const listPosts = (db, query) => listPage(db.from('posts').select(LIST_COLUMNS), query)

/** A post with every image uploaded for it, for the editor. */
export async function getPost(db, id) {
  const post = await findOne(db, 'posts', ARTICLE_COLUMNS, id)
  return { ...post, images: await postImages(db, id) }
}

const imageIdsIn = (sections = []) => sections.map((s) => s.image_id).filter(Boolean)

/** Sections are JSON, so the database cannot check their pictures: each must be one uploaded for this post. */
async function assertImagesBelong(db, postId, sections) {
  const used = imageIdsIn(sections)
  if (used.length === 0) return
  const own = byId(
    unwrap(await db.from('post_images').select('id').eq('post_id', postId).in('id', used)),
  )
  if (used.some((id) => !own.has(id))) {
    throw fieldError('sections', 'A section uses an image that does not belong to this post.')
  }
}

/** A refused publish names every problem, one entry per field. */
function problemDetails(problems) {
  return problems.reduce(
    (details, { field, message }) => ({
      ...details,
      [field]: details[field] ? `${details[field]} ${message}` : message,
    }),
    {},
  )
}

function assertPublishable(post) {
  const problems = publishProblems(post)
  if (problems.length > 0) {
    throw new AppError('VALIDATION_FAILED', {
      message: 'This post is not ready to publish.',
      details: problemDetails(problems),
    })
  }
}

/** A new post is a draft, and has no images yet, so no section can use one. */
export async function createPost(db, userId, input) {
  if (imageIdsIn(input.sections).length > 0) {
    throw fieldError('sections', 'Upload an image before a section can use it.')
  }
  const post = await insertOne(db, 'posts', ARTICLE_COLUMNS, { ...input, created_by: userId })
  return { ...post, images: [] }
}

/** Change a post. Whatever it ends up as, a published post must still pass the publishing rules. */
export async function updatePost(db, id, input) {
  const current = await findOne(db, 'posts', ARTICLE_COLUMNS, id)
  const next = { ...current, ...input }
  if (input.sections) await assertImagesBelong(db, id, input.sections)
  if (next.status === 'published') assertPublishable(next)
  await updateOne(db, 'posts', 'id', id, input)
  return getPost(db, id)
}

/** Delete a post and its images' files together. */
export async function deletePost(db, id) {
  const images = unwrap(await db.from('post_images').select('storage_path').eq('post_id', id))
  await findOne(db, 'posts', 'id', id)
  unwrap(await db.from('posts').delete().eq('id', id))
  await removeStoredFiles(images.map((image) => image.storage_path))
}

/** A signed link to upload one image to. The file goes straight to the public bucket. */
export async function createImageUpload(
  db,
  postId,
  { content_type: contentType, size_bytes: sizeBytes },
) {
  await findOne(db, 'posts', 'id', postId)
  const key = blogImageKey(postId, randomUUID(), contentType)
  return { storage_path: key, ...(await createUploadUrl({ key, contentType, sizeBytes })) }
}

/** Save an image once its file is in storage and has been checked. Alt text is required. */
export async function addImage(db, postId, input) {
  await findOne(db, 'posts', 'id', postId)
  if (!input.storage_path.startsWith(`blog/${postId}/`)) {
    throw fieldError(
      'storage_path',
      'That file does not belong to this post. Request an upload link first.',
    )
  }
  await assertUploaded(input.storage_path, {
    sizeBytes: input.size_bytes,
    contentType: input.content_type,
    purpose: 'blog_image',
  })
  return insertOne(db, 'post_images', IMAGE_COLUMNS, { post_id: postId, ...input })
}

/** Change a picture's description or caption. It must be one of this post's own pictures. */
export async function updateImage(db, postId, imageId, changes) {
  const image = unwrap(
    await db.from('post_images').select('id').eq('id', imageId).eq('post_id', postId).maybeSingle(),
  )
  if (!image) throw new AppError('NOT_FOUND')
  return updateOne(db, 'post_images', IMAGE_COLUMNS, imageId, changes)
}

const withoutImage = (sections, imageId) =>
  sections.map(({ image_id: used, ...section }) =>
    used === imageId ? section : { ...section, image_id: used },
  )

/** Remove an image: its record, its file, and any section that showed it. A cover is cleared by the database. */
export async function removeImage(db, postId, imageId) {
  const image = unwrap(
    await db
      .from('post_images')
      .select('id, storage_path')
      .eq('id', imageId)
      .eq('post_id', postId)
      .maybeSingle(),
  )
  if (!image) throw new AppError('NOT_FOUND')
  const post = await findOne(db, 'posts', 'sections', postId)
  if (imageIdsIn(post.sections).includes(imageId)) {
    await updateOne(db, 'posts', 'id', postId, { sections: withoutImage(post.sections, imageId) })
  }
  unwrap(await db.from('post_images').delete().eq('id', imageId))
  await removeStoredFiles([image.storage_path])
}
