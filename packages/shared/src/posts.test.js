import { describe, expect, it } from 'vitest'
import {
  hasOnlySiteLinks,
  publishProblems,
  readingMinutes,
  slugify,
  splitLinks,
  wordCount,
} from './posts.js'
import { addImageSchema, createPostSchema, updatePostSchema } from './schemas/posts.js'

const words = (count) => Array.from({ length: count }, () => 'word').join(' ')

const readyPost = {
  keyword: 'car hire in Kenya',
  title: 'Car hire in Kenya: the guide',
  description: `A plain guide to car hire in Kenya. ${words(12)}`,
  intro: 'Car hire in Kenya is simple once you know the choices.',
  sections: [{ id: 'a', heading: 'A', paragraphs: [words(400)] }],
  faq: [1, 2, 3].map((n) => ({ q: `Question ${n}?`, a: 'Answer.' })),
  related: [{ label: 'Cars', href: '/cars' }],
}

describe('publishProblems', () => {
  it('finds nothing wrong with a finished guide', () => {
    expect(publishProblems(readyPost)).toEqual([])
  })

  it('names each problem with the field it belongs to', () => {
    const problems = publishProblems({
      ...readyPost,
      title: 'Guide',
      intro: 'Hello.',
      faq: [],
      related: [],
    })
    expect(problems.map((p) => p.field)).toEqual(['title', 'intro', 'faq', 'related'])
  })

  it('asks for the keyword first, and does not also fault the title and intro for lacking it', () => {
    const problems = publishProblems({ ...readyPost, keyword: '' })
    expect(problems.map((p) => p.field)).toEqual(['keyword'])
  })

  it('holds the description and the length to their limits', () => {
    expect(publishProblems({ ...readyPost, description: 'Short.' })[0].field).toBe('description')
    expect(
      publishProblems({ ...readyPost, title: `Car hire in Kenya ${words(20)}` })[0].field,
    ).toBe('title')
    const thin = { ...readyPost, sections: [{ id: 'a', heading: 'A', paragraphs: ['Few words.'] }] }
    expect(publishProblems(thin)[0].field).toBe('sections')
  })
})

describe('links and text', () => {
  it('splits a sentence into text and site links, and leaves outside links as text', () => {
    expect(splitLinks('See [car hire](/car-hire) now.')).toEqual([
      { type: 'text', text: 'See ' },
      { type: 'link', text: 'car hire', href: '/car-hire' },
      { type: 'text', text: ' now.' },
    ])
    expect(splitLinks('Visit [x](https://example.com)')).toEqual([
      { type: 'text', text: 'Visit [x](https://example.com)' },
    ])
  })

  it('accepts only addresses on this site, not another site or a protocol-relative address', () => {
    expect(hasOnlySiteLinks('See [a](/cars) and [b](/blog/x).')).toBe(true)
    expect(hasOnlySiteLinks('See [a](https://example.com).')).toBe(false)
    expect(hasOnlySiteLinks('See [a](//example.com).')).toBe(false)
  })

  it('counts links by their visible text and rounds reading time to whole minutes, never below one', () => {
    expect(wordCount({ intro: 'See [car hire](/car-hire) now', sections: [] })).toBe(4)
    expect(readingMinutes({ intro: 'a b c', sections: [] })).toBe(1)
    expect(readingMinutes({ intro: words(600), sections: [] })).toBe(3)
  })

  it('makes an address from a title', () => {
    expect(slugify('Car hire in Kenya: the complete guide!')).toBe(
      'car-hire-in-kenya-the-complete-guide',
    )
    expect(slugify('???')).toBe('')
  })
})

describe('what the API accepts', () => {
  it('makes the address and the section anchors from the words the writer typed', () => {
    const post = createPostSchema.parse({
      title: 'Self-drive or chauffeur?',
      sections: [{ heading: 'Who drives', paragraphs: ['You do.'] }],
    })
    expect(post.slug).toBe('self-drive-or-chauffeur')
    expect(post.sections[0].id).toBe('who-drives')
  })
})

describe('what the API refuses', () => {
  it.each([
    ['a link to another site', { title: 'T', intro: 'See [x](https://example.com).' }],
    [
      'two sections with one heading',
      {
        title: 'T',
        sections: [
          { heading: 'Same', paragraphs: ['a'] },
          { heading: 'Same', paragraphs: ['b'] },
        ],
      },
    ],
    ['a title with no letters', { title: '???' }],
    [
      'a related link off the site',
      { title: 'T', related: [{ label: 'x', href: 'https://x.com' }] },
    ],
  ])('refuses %s', (_name, input) => {
    expect(createPostSchema.safeParse(input).success).toBe(false)
  })
})

describe('what an update and an image must have', () => {
  it('needs at least one field to change, and refuses an unknown one', () => {
    expect(updatePostSchema.safeParse({}).success).toBe(false)
    expect(updatePostSchema.safeParse({ status: 'published' }).success).toBe(true)
    expect(updatePostSchema.safeParse({ cover_image_id: null }).success).toBe(true)
    expect(updatePostSchema.safeParse({ author: 'me' }).success).toBe(false)
  })

  it('refuses an image that is too big, or not a picture type we allow, or has no alt text', () => {
    const image = {
      storage_path: 'blog/a/b.jpg',
      content_type: 'image/jpeg',
      size_bytes: 1000,
      width: 800,
      height: 600,
      alt_text: 'A car',
    }
    expect(addImageSchema.safeParse(image).success).toBe(true)
    expect(addImageSchema.safeParse({ ...image, size_bytes: 6 * 1024 * 1024 }).success).toBe(false)
    expect(addImageSchema.safeParse({ ...image, content_type: 'image/svg+xml' }).success).toBe(
      false,
    )
    expect(addImageSchema.safeParse({ ...image, alt_text: '  ' }).success).toBe(false)
  })
})
