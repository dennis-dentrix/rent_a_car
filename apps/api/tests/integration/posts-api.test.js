import { describe, expect, it } from 'vitest'
import { accounts, call, errorOf, putFile, sampleFile, withApi } from './api-client.js'

const db = withApi()

const KEYWORD = 'car hire in Kenya'
// Four paragraphs of 90 words: a paragraph is limited to 2000 characters, and a guide to 350 words.
const paragraph = Array.from({ length: 90 }, () => 'word').join(' ')
const guideText = [paragraph, paragraph, paragraph, paragraph]

// Everything the publishing rules ask for (packages/shared/src/posts.js), so a test can publish in one call.
const finishedPost = (slug, overrides = {}) => ({
  slug,
  title: `API guide to ${KEYWORD}`,
  keyword: KEYWORD,
  description:
    'A plain guide used by the tests, long enough to meet the description rule that search results need.',
  intro: `This guide explains ${KEYWORD} in plain words.`,
  sections: [{ heading: 'The first section', paragraphs: guideText }],
  faq: [1, 2, 3].map((n) => ({ q: `Question number ${n}?`, a: 'An answer.' })),
  related: [{ label: 'Find a car', href: '/cars' }],
  ...overrides,
})

const admin = (method, path, body) => call(method, path, { body, token: accounts.admin })
const createDraft = async (slug, overrides) =>
  (await admin('POST', '/admin/posts', finishedPost(slug, overrides))).body.data
const publish = (id) => admin('PATCH', `/admin/posts/${id}`, { status: 'published' })

// Upload one picture for a post the way the editor does: ask for a link, send the file, then save it with its alt text.
async function addPicture(postId, { alt_text = 'A car at the airport', bytes } = {}) {
  const declared = { content_type: 'image/jpeg', size_bytes: 2048 }
  const link = (await admin('POST', `/admin/posts/${postId}/image-uploads`, declared)).body.data
  await putFile(link, bytes ?? sampleFile('image/jpeg', 2048))
  return admin('POST', `/admin/posts/${postId}/images`, {
    ...declared,
    storage_path: link.storage_path,
    width: 1200,
    height: 800,
    alt_text,
  })
}

describe('writing posts', () => {
  it.each([
    ['a customer', () => accounts.customer],
    ['staff', () => accounts.staff],
  ])('is for admin only: refuses %s', async (_name, token) => {
    const response = await call('GET', '/admin/posts', { token: token() })
    expect(errorOf(response)).toEqual([403, 'FORBIDDEN'])
  })

  it('saves a draft, makes its address from the title, and hides it from readers', async () => {
    const created = await admin('POST', '/admin/posts', { title: 'API Self-drive or chauffeur?' })
    expect(created.status).toBe(201)
    expect(created.body.data).toMatchObject({
      slug: 'api-self-drive-or-chauffeur',
      status: 'draft',
    })
    expect(errorOf(await call('GET', '/posts/api-self-drive-or-chauffeur'))).toEqual([
      404,
      'NOT_FOUND',
    ])
    const listed = await call('GET', '/posts')
    expect(listed.body.data.map((post) => post.slug)).not.toContain('api-self-drive-or-chauffeur')
  })
})

describe('what the editor sends', () => {
  it('lists posts for the editor, newest first, drafts included', async () => {
    await createDraft('api-first')
    await createDraft('api-second')
    const { body } = await admin('GET', '/admin/posts?limit=2')
    expect(body.data.map((post) => post.slug)).toEqual(['api-second', 'api-first'])
  })

  it('refuses a link to another site with the field named', async () => {
    const response = await admin('POST', '/admin/posts', {
      title: 'API T',
      intro: 'See [x](https://example.com).',
    })
    expect(errorOf(response)).toEqual([400, 'VALIDATION_FAILED'])
    expect(response.body.error.details).toHaveProperty('intro')
  })

  it('maps the database refusal to change a published address to a validation error', async () => {
    const { id } = await createDraft('api-locked')
    await publish(id)
    const response = await admin('PATCH', `/admin/posts/${id}`, { slug: 'api-renamed' })
    expect(errorOf(response)).toEqual([400, 'VALIDATION_FAILED'])
  })
})

describe('publishing', () => {
  it('names every problem when a post is not ready', async () => {
    const { id } = await createDraft('api-thin', {
      title: 'API Thin',
      intro: 'Short.',
      faq: [],
      related: [],
    })
    const response = await publish(id)
    expect(errorOf(response)).toEqual([400, 'VALIDATION_FAILED'])
    expect(Object.keys(response.body.error.details).sort()).toEqual(
      ['faq', 'intro', 'related', 'title'].sort(),
    )
  })

  it('keeps a published post publishable: an edit that breaks a rule is refused', async () => {
    const { id } = await createDraft('api-live')
    expect((await publish(id)).status).toBe(200)
    const response = await admin('PATCH', `/admin/posts/${id}`, { faq: [] })
    expect(errorOf(response)).toEqual([400, 'VALIDATION_FAILED'])
  })

  it('shows a published post to guests, with reading time, and takes it down when unpublished', async () => {
    const { id } = await createDraft('api-visible')
    await publish(id)
    const card = (await call('GET', '/posts')).body.data.find((post) => post.slug === 'api-visible')
    expect(card).toMatchObject({
      title: `API guide to ${KEYWORD}`,
      reading_minutes: 2,
      cover: null,
    })
    expect(card).not.toHaveProperty('sections')
    const article = await call('GET', '/posts/api-visible')
    expect(article.status).toBe(200)
    expect(article.body.data.sections[0].id).toBe('the-first-section')
    await admin('PATCH', `/admin/posts/${id}`, { status: 'draft' })
    expect((await call('GET', '/posts/api-visible')).status).toBe(404)
  })
})

describe('images', () => {
  it('uploads a picture, shows it in a section and as the cover, and resolves both for readers', async () => {
    const { id } = await createDraft('api-pictures')
    const added = await addPicture(id)
    expect(added.status).toBe(201)
    const imageId = added.body.data.id
    await admin('PATCH', `/admin/posts/${id}`, {
      cover_image_id: imageId,
      sections: [{ heading: 'The first section', paragraphs: guideText, image_id: imageId }],
    })
    await publish(id)
    const { body } = await call('GET', '/posts/api-pictures')
    expect(body.data.cover).toMatchObject({
      id: imageId,
      alt_text: 'A car at the airport',
      width: 1200,
    })
    expect(body.data.sections[0].image).toMatchObject({ id: imageId, height: 800 })
    const card = (await call('GET', '/posts')).body.data.find(
      (post) => post.slug === 'api-pictures',
    )
    expect(card.cover.id).toBe(imageId)
  })
})

describe('refused images', () => {
  it('needs alt text, and refuses a file that is not the picture it claims to be', async () => {
    const { id } = await createDraft('api-checks')
    expect(errorOf(await addPicture(id, { alt_text: '  ' }))).toEqual([400, 'VALIDATION_FAILED'])
    const fake = await addPicture(id, { bytes: sampleFile('application/pdf', 2048) })
    expect(errorOf(fake)).toEqual([400, 'VALIDATION_FAILED'])
    const { rows } = await db.query('select id from post_images where post_id = $1', [id])
    expect(rows).toEqual([])
  })

  it('refuses a picture saved against another post, and a section that uses one', async () => {
    const mine = await createDraft('api-mine')
    const theirs = await createDraft('api-theirs')
    const theirImage = (await addPicture(theirs.id)).body.data
    const stolen = await admin('POST', `/admin/posts/${mine.id}/images`, {
      content_type: 'image/jpeg',
      size_bytes: 2048,
      storage_path: theirImage.storage_path,
      width: 10,
      height: 10,
      alt_text: 'x',
    })
    const used = await admin('PATCH', `/admin/posts/${mine.id}`, {
      sections: [{ heading: 'A', paragraphs: ['b'], image_id: theirImage.id }],
    })
    expect(errorOf(stolen)).toEqual([400, 'VALIDATION_FAILED'])
    expect(errorOf(used)).toEqual([400, 'VALIDATION_FAILED'])
  })
})

describe("changing a picture's text", () => {
  const edit = (postId, imageId, body) =>
    admin('PATCH', `/admin/posts/${postId}/images/${imageId}`, body)

  it('changes the description and the caption, and clears the caption with null', async () => {
    const { id } = await createDraft('api-text')
    const image = (await addPicture(id)).body.data
    const changed = await edit(id, image.id, {
      alt_text: 'A new description',
      caption: 'A caption',
    })
    expect(changed.body.data).toMatchObject({ alt_text: 'A new description', caption: 'A caption' })
    const cleared = await edit(id, image.id, { caption: null })
    expect(cleared.body.data).toMatchObject({ alt_text: 'A new description', caption: null })
  })

  it('refuses an empty description, an empty change, and a picture of another post', async () => {
    const mine = await createDraft('api-text-mine')
    const theirs = await createDraft('api-text-theirs')
    const image = (await addPicture(theirs.id)).body.data
    expect(errorOf(await edit(theirs.id, image.id, { alt_text: ' ' }))).toEqual([
      400,
      'VALIDATION_FAILED',
    ])
    expect(errorOf(await edit(theirs.id, image.id, {}))).toEqual([400, 'VALIDATION_FAILED'])
    expect(errorOf(await edit(mine.id, image.id, { alt_text: 'x' }))).toEqual([404, 'NOT_FOUND'])
  })
})

describe('removing images and posts', () => {
  it('removes an image from the post, its sections, and its cover', async () => {
    const { id } = await createDraft('api-remove')
    const imageId = (await addPicture(id)).body.data.id
    await admin('PATCH', `/admin/posts/${id}`, {
      cover_image_id: imageId,
      sections: [{ heading: 'A', paragraphs: ['b'], image_id: imageId }],
    })
    const removed = await admin('DELETE', `/admin/posts/${id}/images/${imageId}`)
    expect(removed.status).toBe(200)
    const post = (await admin('GET', `/admin/posts/${id}`)).body.data
    expect(post.cover_image_id).toBeNull()
    expect(post.sections[0]).not.toHaveProperty('image_id')
    expect(post.images).toEqual([])
  })

  it('deletes a post together with its images', async () => {
    const { id } = await createDraft('api-delete')
    await addPicture(id)
    expect((await admin('DELETE', `/admin/posts/${id}`)).status).toBe(200)
    const { rows } = await db.query('select id from post_images where post_id = $1', [id])
    expect(rows).toEqual([])
    expect(errorOf(await admin('GET', `/admin/posts/${id}`))).toEqual([404, 'NOT_FOUND'])
  })
})
