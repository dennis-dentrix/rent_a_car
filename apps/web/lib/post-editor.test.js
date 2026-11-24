import { describe, expect, it } from 'vitest'
import {
  blankQuestion,
  blankSection,
  draftFromPost,
  moved,
  payloadFromDraft,
  previewOf,
  readinessOf,
  saveProblems,
  textToItems,
  textToParagraphs,
  withoutImage,
} from './post-editor.js'

const post = {
  title: 'Car hire in Kenya',
  slug: 'car-hire-in-kenya',
  keyword: 'car hire',
  description: 'd',
  intro: 'Intro about car hire.',
  sections: [
    {
      id: 'a',
      heading: 'First',
      paragraphs: ['One.', 'Two.'],
      items: ['x', 'y'],
      image_id: 'img-1',
    },
  ],
  faq: [{ q: 'Why hire a car?', a: 'Because.' }],
  related: [{ label: 'Cars', href: '/cars' }],
  cover_image_id: 'img-1',
}

describe('text boxes and lists', () => {
  it('turns blank-line separated text into paragraphs, and lines into list items', () => {
    expect(textToParagraphs('One.\n\n  Two.  \n\n\n')).toEqual(['One.', 'Two.'])
    expect(textToItems('a\n\n b \n')).toEqual(['a', 'b'])
  })

  it('round-trips a guide through the editor without changing it', () => {
    const payload = payloadFromDraft(draftFromPost(post), { canChangeSlug: true })
    expect(payload).toMatchObject({
      slug: 'car-hire-in-kenya',
      sections: [
        { heading: 'First', paragraphs: ['One.', 'Two.'], items: ['x', 'y'], image_id: 'img-1' },
      ],
      faq: post.faq,
      related: post.related,
      cover_image_id: 'img-1',
    })
  })
})

describe('what is sent', () => {
  it('leaves out rows left empty, the slug once it is fixed, and a cover that is not chosen', () => {
    const draft = { ...draftFromPost(post), coverImageId: '', slug: 'changed' }
    draft.sections.push(blankSection())
    draft.faq.push(blankQuestion())
    const payload = payloadFromDraft(draft)
    expect(payload.sections).toHaveLength(1)
    expect(payload.faq).toHaveLength(1)
    expect(payload).not.toHaveProperty('slug')
    expect(payload.cover_image_id).toBeNull()
  })

  it('names a row that is half filled, in the writer’s words', () => {
    const draft = draftFromPost(post)
    draft.sections.push({ ...blankSection(), heading: 'Only a heading' })
    draft.faq.push({ ...blankQuestion(), q: 'A question with no answer?' })
    expect(saveProblems(draft)).toEqual([
      'Section 2 needs at least one paragraph.',
      'Question 2 needs both a question and an answer.',
    ])
    expect(saveProblems({ ...draftFromPost(post), title: ' ' })).toEqual([
      'Give the guide a title.',
    ])
  })
})

describe('readiness and preview', () => {
  it('reports the shared publishing rules for the text as it stands', () => {
    expect(readinessOf(draftFromPost(post)).map((p) => p.field)).toContain('description')
  })

  it('builds the article as readers see it, with its images found by id', () => {
    const images = [
      { id: 'img-1', storage_path: 'blog/p/a.jpg', alt_text: 'A', width: 1, height: 1 },
    ]
    const preview = previewOf(draftFromPost(post), images)
    expect(preview.cover.alt_text).toBe('A')
    expect(preview.sections[0]).toMatchObject({ id: 'first', image: { id: 'img-1' } })
  })
})

describe('moved', () => {
  it('moves a row up or down, and ignores a move off either end', () => {
    expect(moved(['a', 'b', 'c'], 2, 1)).toEqual(['a', 'c', 'b'])
    expect(moved(['a', 'b', 'c'], 0, -1)).toEqual(['a', 'b', 'c'])
    expect(moved(['a', 'b', 'c'], 2, 3)).toEqual(['a', 'b', 'c'])
  })
})

describe('withoutImage', () => {
  it('lets go of a deleted picture wherever the draft used it, and leaves other pictures alone', () => {
    const draft = draftFromPost(post)
    draft.sections.push({ ...blankSection(), imageId: 'img-2' })
    const cleaned = withoutImage(draft, 'img-1')
    expect(cleaned.coverImageId).toBe('')
    expect(cleaned.sections.map((s) => s.imageId)).toEqual(['', 'img-2'])
  })
})
