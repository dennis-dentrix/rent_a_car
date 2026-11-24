// Rules about the text of a blog or guide, shared by the API (what must be true before a post is published) and
// the web app (reading time, links). The stored shape is in schemas/posts.js.
const WORDS_PER_MINUTE = 200

// "[text](address)". The global flag is safe here because the pattern is only used with matchAll and replace.
const LINK = /\[([^\]]+)\]\(([^)\s]*)\)/g

/** An address on this site: starts with one slash, so never another site and never "//host". */
export const isSiteAddress = (href) => /^\/(?!\/)\S*$/.test(href)

/** An article may link to the service pages and other guides, never off the site. */
export const hasOnlySiteLinks = (text) =>
  [...text.matchAll(LINK)].every((match) => isSiteAddress(match[2]))

/** "Car hire in Kenya: the guide" becomes "car-hire-in-kenya-the-guide". */
export const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100)
    .replace(/-+$/, '')

/**
 * Splits a sentence into plain text and links. Only addresses on this site are links; anything else stays as
 * the text it was written as.
 */
export function splitLinks(text) {
  const parts = []
  let last = 0
  for (const match of text.matchAll(LINK)) {
    if (!isSiteAddress(match[2])) continue
    if (match.index > last) parts.push({ type: 'text', text: text.slice(last, match.index) })
    parts.push({ type: 'link', text: match[1], href: match[2] })
    last = match.index + match[0].length
  }
  if (last < text.length) parts.push({ type: 'text', text: text.slice(last) })
  return parts
}

const bodyText = (post) =>
  [post.intro, ...post.sections.flatMap((s) => [...s.paragraphs, ...(s.items ?? [])])].join(' ')

/** Words in the body, links counted by their visible text. */
export const wordCount = (post) =>
  bodyText(post).replace(LINK, '$1').split(/\s+/).filter(Boolean).length

export const readingMinutes = (post) => Math.max(1, Math.round(wordCount(post) / WORDS_PER_MINUTE))

export const PUBLISH_LIMITS = {
  titleMax: 75,
  descriptionMin: 80,
  descriptionMax: 165,
  minQuestions: 3,
  minWords: 350,
}

const mentions = (text, keyword) => text.toLowerCase().includes(keyword.toLowerCase())
const { titleMax, descriptionMin, descriptionMax, minQuestions, minWords } = PUBLISH_LIMITS

// Each rule says where the problem is, what to do, and how to tell it is met. A rule about the keyword waits
// until a keyword is set, so the writer sees one problem first, not three.
const RULES = [
  {
    field: 'keyword',
    message: 'Add the main search term this guide answers.',
    isMet: (post) => Boolean(post.keyword),
  },
  {
    field: 'title',
    message: 'The title must contain the main search term.',
    isMet: (post) => !post.keyword || mentions(post.title, post.keyword),
  },
  {
    field: 'intro',
    message: 'The opening paragraph must contain the main search term.',
    isMet: (post) => !post.keyword || mentions(post.intro, post.keyword),
  },
  {
    field: 'title',
    message: `Keep the title to ${titleMax} characters or fewer.`,
    isMet: (post) => post.title.length <= titleMax,
  },
  {
    field: 'description',
    message: `Write a description of ${descriptionMin} to ${descriptionMax} characters.`,
    isMet: (post) =>
      post.description.length >= descriptionMin && post.description.length <= descriptionMax,
  },
  {
    field: 'faq',
    message: `Answer at least ${minQuestions} questions.`,
    isMet: (post) => post.faq.length >= minQuestions,
  },
  {
    field: 'sections',
    message: `Write at least ${minWords} words, so the guide answers its question.`,
    isMet: (post) => wordCount(post) >= minWords,
  },
  {
    field: 'related',
    message: 'Link at least one page the reader can act on.',
    isMet: (post) => post.related.length >= 1,
  },
]

/**
 * What stops a post from being published, as [{ field, message }], empty when it is ready. A draft may be
 * incomplete; these are the rules a reader and a search engine expect of a finished guide.
 */
export const publishProblems = (post) =>
  RULES.filter((rule) => !rule.isMet(post)).map(({ field, message }) => ({ field, message }))
