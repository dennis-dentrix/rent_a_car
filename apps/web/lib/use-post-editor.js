import { attempt } from '@/lib/attempt'
import { useEffect, useState } from 'react'
import { removeImageAction, savePostAction, updateImageAction } from '@/app/admin/posts/actions'
import { copy } from '@/copy/en'
import { draftFromPost, payloadFromDraft, saveProblems, withoutImage } from '@/lib/post-editor'

const text = copy.editor

/** What the API said was wrong, as sentences: one per field, or a plain one when it said nothing. */
const messagesFrom = (result) =>
  result.details ? Object.values(result.details) : [text.errors.generic]

/** Warns before the tab is closed or reloaded while there is writing that has not been saved. */
function useLeaveGuard(isActive) {
  useEffect(() => {
    if (!isActive) return undefined
    const warn = (event) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [isActive])
}

/**
 * The pictures of the guide. Removing one takes it off the screen at once and puts it back, with a message, if the
 * server refuses; adding one only shows it after the server has kept it.
 */
function useImages({ postId, initial, draft, setDraft, setProblems }) {
  const [images, setImages] = useState(initial)
  const remove = async (imageId) => {
    const before = { images, draft }
    setImages(images.filter((image) => image.id !== imageId))
    setDraft(withoutImage(draft, imageId))
    const result = await attempt(() => removeImageAction(postId, imageId))
    if (!result.error) return
    setImages(before.images)
    setDraft(before.draft)
    setProblems([text.images.errors.remove])
  }
  const update = async (imageId, changes) => {
    const result = await attempt(() => updateImageAction(postId, imageId, changes))
    if (result.error) return false
    setImages((list) => list.map((image) => (image.id === imageId ? result.data : image)))
    return true
  }
  return {
    images,
    setImages,
    add: (image) => setImages((list) => [image, ...list]),
    remove,
    update,
  }
}

/** After the server has kept the guide: its answer replaces what was held, and nothing is waiting to be saved. */
function applySaved(ctx, data) {
  ctx.setPost(data)
  ctx.setImages(data.images)
  ctx.setIsDirty(false)
  ctx.setDraft((current) => ({ ...current, slug: data.slug }))
  ctx.setSaveState({ kind: 'saved', at: new Date() })
}

/** Saves the text on screen, with `extra` changes (a new status). Resolves true when the server kept it. */
async function saveGuide(ctx, extra = {}) {
  const found = saveProblems(ctx.draft)
  if (found.length > 0) {
    ctx.setProblems(found)
    return false
  }
  ctx.setProblems([])
  ctx.setSaveState({ kind: 'saving' })
  const canChangeSlug = ctx.post.status === 'draft' && !ctx.post.published_at
  const changes = { ...payloadFromDraft(ctx.draft, { canChangeSlug }), ...extra }
  const result = await attempt(() => savePostAction(ctx.post.id, changes))
  if (result.error) {
    ctx.setSaveState({ kind: 'failed' })
    ctx.setProblems(messagesFrom(result))
    return false
  }
  applySaved(ctx, result.data)
  return true
}

async function unpublishGuide(ctx) {
  const result = await attempt(() => savePostAction(ctx.post.id, { status: 'draft' }))
  if (result.error) ctx.setProblems(messagesFrom(result))
  else ctx.setPost(result.data)
}

/** Saving, publishing, and unpublishing. What the guide is (draft or published) only ever comes from the server. */
function useSaver(ctx) {
  const [saveState, setSaveState] = useState({ kind: 'idle' })
  const [pendingStatus, setPendingStatus] = useState(null)
  const withStatus = async (name, work) => {
    setPendingStatus(name)
    await work({ ...ctx, setSaveState })
    setPendingStatus(null)
  }
  return {
    saveState,
    pendingStatus,
    canChangeSlug: ctx.post.status === 'draft' && !ctx.post.published_at,
    save: () => saveGuide({ ...ctx, setSaveState }),
    publish: () => withStatus('publishing', (c) => saveGuide(c, { status: 'published' })),
    unpublish: () => withStatus('unpublishing', unpublishGuide),
  }
}

/** Everything the guide editor needs: the text being written, the pictures, and the saving, with their states. */
export function usePostEditor(initial) {
  const [post, setPost] = useState(initial)
  const [draft, setDraft] = useState(() => draftFromPost(initial))
  const [isDirty, setIsDirty] = useState(false)
  const [problems, setProblems] = useState([])
  const images = useImages({
    postId: initial.id,
    initial: initial.images,
    draft,
    setDraft,
    setProblems,
  })
  const saver = useSaver({
    post,
    setPost,
    draft,
    setDraft,
    setImages: images.setImages,
    setProblems,
    setIsDirty,
  })
  useLeaveGuard(isDirty || saver.saveState.kind === 'saving')
  const change = (patch) => {
    setDraft((current) => ({ ...current, ...patch }))
    setIsDirty(true)
  }
  return { post, draft, change, isDirty, problems, images, ...saver }
}
