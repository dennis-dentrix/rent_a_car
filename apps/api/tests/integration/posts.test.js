import { describe, expect, it } from 'vitest'
import { actAs, actAsOwner, attempt, ids, isBlocked, withSeededTransaction } from './helpers.js'

const CHECK_VIOLATION = '23514'

const client = withSeededTransaction()

const insertPost = async (slug, status = 'draft') =>
  (
    await client.query('insert into posts (slug, title, status) values ($1, $2, $3) returning id', [
      slug,
      `Title of ${slug}`,
      status,
    ])
  ).rows[0].id

const insertImage = async (postId, name = 'a') =>
  (
    await client.query(
      `insert into post_images (post_id, storage_path, content_type, size_bytes, width, height, alt_text)
       values ($1, $2, 'image/jpeg', 1000, 800, 600, 'A car') returning id`,
      [postId, `blog/${postId}/${name}.jpg`],
    )
  ).rows[0].id

const slugsSeenBy = async (userId) => {
  await actAs(client, userId)
  const { rows } = await client.query(
    "select slug from posts where slug like 'fixture-%' order by slug",
  )
  await actAsOwner(client)
  return rows.map((row) => row.slug)
}

describe('who can read posts', () => {
  const setUp = async () => {
    const live = await insertPost('fixture-live', 'published')
    const draft = await insertPost('fixture-draft')
    return { liveImage: await insertImage(live), draftImage: await insertImage(draft) }
  }

  it('shows a guest only what is published, and only the images of what is published', async () => {
    const { liveImage, draftImage } = await setUp()
    expect(await slugsSeenBy(null)).toEqual(['fixture-live'])
    await actAs(client, null)
    const images = (await client.query('select id from post_images')).rows.map((row) => row.id)
    expect(images).toContain(liveImage)
    expect(images).not.toContain(draftImage)
  })

  it('shows staff and customers no drafts, and an admin everything', async () => {
    await setUp()
    expect(await slugsSeenBy(ids.staff)).toEqual(['fixture-live'])
    expect(await slugsSeenBy(ids.custA)).toEqual(['fixture-live'])
    expect(await slugsSeenBy(ids.admin)).toEqual(['fixture-draft', 'fixture-live'])
  })
})

describe('who can write posts and their images', () => {
  const write = (userId, sql, params = []) =>
    actAs(client, userId).then(() => attempt(client, sql, params))

  it.each([
    ['a guest', null],
    ['a customer', ids.custA],
    ['staff', ids.staff],
  ])('refuses %s', async (_name, userId) => {
    const result = await write(userId, "insert into posts (slug, title) values ('fixture-x', 'X')")
    expect(isBlocked(result)).toBe(true)
  })

  it('lets an admin create, change, and delete a post and its images', async () => {
    const created = await write(
      ids.admin,
      "insert into posts (slug, title) values ('fixture-x', 'X') returning id",
    )
    const postId = created.rows[0].id
    const image = await write(
      ids.admin,
      `insert into post_images (post_id, storage_path, content_type, size_bytes, width, height, alt_text)
       values ($1, 'blog/x/a.jpg', 'image/jpeg', 1, 1, 1, 'Alt')`,
      [postId],
    )
    const edited = await write(ids.admin, "update posts set title = 'Y' where id = $1", [postId])
    const removed = await write(ids.admin, 'delete from posts where id = $1', [postId])
    expect([created.error, image.error, edited.error, removed.error]).toEqual([
      null,
      null,
      null,
      null,
    ])
  })
})

describe('the audit log', () => {
  it('records who changed a post', async () => {
    await actAs(client, ids.admin)
    await client.query("insert into posts (slug, title) values ('fixture-x', 'X')")
    await actAsOwner(client)
    const { rows } = await client.query(
      "select actor_id from audit_log where table_name = 'posts' and new_values ->> 'slug' = 'fixture-x'",
    )
    expect(rows).toEqual([{ actor_id: ids.admin }])
  })
})

describe('publishing', () => {
  it('stamps the publication date the first time and keeps it through unpublishing', async () => {
    const id = await insertPost('fixture-a')
    await client.query("update posts set status = 'published' where id = $1", [id])
    await client.query("update posts set published_at = '2026-01-01T00:00:00Z' where id = $1", [id])
    await client.query("update posts set status = 'draft' where id = $1", [id])
    await client.query("update posts set status = 'published' where id = $1", [id])
    const { rows } = await client.query('select published_at from posts where id = $1', [id])
    expect(rows[0].published_at.toISOString()).toBe('2026-01-01T00:00:00.000Z')
  })

  it('keeps the address of a post once it has been published, but lets a draft change', async () => {
    const draft = await insertPost('fixture-draft')
    const live = await insertPost('fixture-live', 'published')
    const renameDraft = await attempt(
      client,
      "update posts set slug = 'fixture-new' where id = $1",
      [draft],
    )
    const renameLive = await attempt(
      client,
      "update posts set slug = 'fixture-new' where id = $1",
      [live],
    )
    expect(renameDraft.error).toBeNull()
    expect(renameLive.error?.message).toContain('VALIDATION_FAILED')
  })

  it('refuses an address that is not lowercase words joined by hyphens', async () => {
    const result = await attempt(
      client,
      "insert into posts (slug, title) values ('Not A Slug', 'X')",
    )
    expect(result.error?.code).toBe(CHECK_VIOLATION)
  })
})

describe('the cover image', () => {
  it("must be one of the post's own images", async () => {
    const mine = await insertPost('fixture-mine')
    const theirs = await insertPost('fixture-theirs')
    const own = await attempt(client, 'update posts set cover_image_id = $2 where id = $1', [
      mine,
      await insertImage(mine),
    ])
    const foreign = await attempt(client, 'update posts set cover_image_id = $2 where id = $1', [
      mine,
      await insertImage(theirs),
    ])
    expect(own.error).toBeNull()
    expect(foreign.error?.message).toContain('VALIDATION_FAILED')
  })

  it('is cleared when its image is removed, and the post stays', async () => {
    const id = await insertPost('fixture-cover')
    const imageId = await insertImage(id)
    await client.query('update posts set cover_image_id = $2 where id = $1', [id, imageId])
    await client.query('delete from post_images where id = $1', [imageId])
    const { rows } = await client.query('select cover_image_id from posts where id = $1', [id])
    expect(rows).toEqual([{ cover_image_id: null }])
  })
})
