import { publishProblems, slugify } from '@carvo/shared/posts'

// The editor keeps a guide as text boxes: a paragraph box is one string, a list box is one item per line. These
// helpers turn that into what the API takes (and back), so the screen never has to think in arrays.

let counter = 0
/** A key React can use to tell list rows apart while they are being edited. */
export const newKey = () => `row-${(counter += 1)}`

export const textToParagraphs = (text) =>
  text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

export const textToItems = (text) =>
  text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

export const paragraphsToText = (paragraphs) => paragraphs.join('\n\n')
export const itemsToText = (items = []) => items.join('\n')

export const blankSection = () => ({
  key: newKey(),
  heading: '',
  paragraphs: '',
  items: '',
  imageId: '',
})
export const blankQuestion = () => ({ key: newKey(), q: '', a: '' })
export const blankLink = () => ({ key: newKey(), label: '', href: '' })

/** A post from the API as the editor holds it. */
export const draftFromPost = (post) => ({
  title: post.title,
  slug: post.slug,
  keyword: post.keyword,
  description: post.description,
  intro: post.intro,
  sections: post.sections.map((section) => ({
    key: newKey(),
    heading: section.heading,
    paragraphs: paragraphsToText(section.paragraphs),
    items: itemsToText(section.items),
    imageId: section.image_id ?? '',
  })),
  faq: post.faq.map((item) => ({ key: newKey(), ...item })),
  related: post.related.map((link) => ({ key: newKey(), ...link })),
  coverImageId: post.cover_image_id ?? '',
})

const isFilled = (...values) => values.some((value) => value.trim() !== '')

/** The text of a guide as the API takes it. Rows left completely empty are dropped. */
export function payloadFromDraft(draft, { canChangeSlug = false } = {}) {
  return {
    title: draft.title.trim(),
    ...(canChangeSlug && draft.slug.trim() ? { slug: draft.slug.trim() } : {}),
    keyword: draft.keyword.trim(),
    description: draft.description.trim(),
    intro: draft.intro.trim(),
    sections: draft.sections
      .filter((s) => isFilled(s.heading, s.paragraphs, s.items))
      .map((s) => ({
        heading: s.heading.trim(),
        paragraphs: textToParagraphs(s.paragraphs),
        ...(textToItems(s.items).length > 0 ? { items: textToItems(s.items) } : {}),
        ...(s.imageId ? { image_id: s.imageId } : {}),
      })),
    faq: draft.faq.filter((f) => isFilled(f.q, f.a)).map((f) => ({ q: f.q.trim(), a: f.a.trim() })),
    related: draft.related
      .filter((l) => isFilled(l.label, l.href))
      .map((l) => ({ label: l.label.trim(), href: l.href.trim() })),
    cover_image_id: draft.coverImageId || null,
  }
}

/** What a draft cannot be saved with, in the writer's words. A draft may be unfinished, but a row cannot be half a row. */
export function saveProblems(draft) {
  const payload = payloadFromDraft(draft)
  const problems = []
  if (!payload.title) problems.push('Give the guide a title.')
  payload.sections.forEach((section, index) => {
    if (!section.heading) problems.push(`Section ${index + 1} needs a heading.`)
    if (section.paragraphs.length === 0)
      problems.push(`Section ${index + 1} needs at least one paragraph.`)
  })
  draft.faq
    .filter((f) => isFilled(f.q, f.a))
    .forEach((item, index) => {
      if (item.q.trim().length < 5 || !item.a.trim())
        problems.push(`Question ${index + 1} needs both a question and an answer.`)
    })
  payload.related.forEach((link, index) => {
    if (!link.label || !link.href) problems.push(`Link ${index + 1} needs a label and an address.`)
  })
  return problems
}

/** What still stops this guide from being published: the shared rules, on the text as it will be saved. */
export const readinessOf = (draft) => publishProblems(payloadFromDraft(draft))

/** A guide as the article page draws it, from the draft and the images uploaded so far. */
export function previewOf(draft, images) {
  const byId = new Map(images.map((image) => [image.id, image]))
  const payload = payloadFromDraft(draft)
  return {
    ...payload,
    published_at: new Date().toISOString(),
    cover: byId.get(draft.coverImageId) ?? null,
    sections: payload.sections.map((section) => ({
      ...section,
      id: slugify(section.heading) || 'section',
      image: byId.get(section.image_id) ?? null,
    })),
  }
}

/** Moves the row at `from` to `to`, for the up and down buttons. Out of range leaves the list as it was. */
export function moved(list, from, to) {
  if (to < 0 || to >= list.length) return list
  const next = [...list]
  next.splice(to, 0, next.splice(from, 1)[0])
  return next
}

/** The draft without a picture that was just deleted: any section that showed it, and the cover, let it go. */
export const withoutImage = (draft, imageId) => ({
  ...draft,
  coverImageId: draft.coverImageId === imageId ? '' : draft.coverImageId,
  sections: draft.sections.map((section) =>
    section.imageId === imageId ? { ...section, imageId: '' } : section,
  ),
})
