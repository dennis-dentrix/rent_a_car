import { z } from 'zod'
import { BLOG_IMAGE_CONTENT_TYPES, MAX_BLOG_IMAGE_BYTES } from '../constants.js'
import { hasOnlySiteLinks, isSiteAddress, slugify } from '../posts.js'
import { hasAtLeastOneField } from './common.js'

// A blog or guide as the API accepts it. A draft may leave most of it empty; docs/content-management.md
// section 5 says what must be true before it is published (see publishProblems in ../posts.js).
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/

const siteText = (max) =>
  z
    .string()
    .trim()
    .min(1)
    .max(max)
    .refine(hasOnlySiteLinks, 'Links must be addresses on this site that start with /.')

const sectionSchema = z
  .strictObject({
    // Written by the editor from the heading when it is not given: it is the contents link's anchor.
    id: z.string().trim().regex(SLUG).max(60).optional(),
    heading: z.string().trim().min(1).max(200),
    paragraphs: z.array(siteText(2000)).min(1).max(30),
    items: z.array(siteText(500)).max(30).optional(),
    image_id: z.uuid().optional(),
  })
  .transform((section) => ({ ...section, id: section.id ?? slugify(section.heading) }))
  .refine((section) => section.id.length > 0, 'The heading needs letters or numbers.')

const hasUniqueIds = (sections) => new Set(sections.map((s) => s.id)).size === sections.length

const faqItem = z.strictObject({
  q: z.string().trim().min(5).max(200),
  a: siteText(1000),
})

const relatedLink = z.strictObject({
  label: z.string().trim().min(1).max(80),
  href: z
    .string()
    .trim()
    .max(200)
    .refine(isSiteAddress, 'Use an address on this site, like /car-hire.'),
})

const postFields = {
  slug: z.string().trim().regex(SLUG).max(100),
  title: z.string().trim().min(1).max(200),
  keyword: z.string().trim().max(100),
  description: z.string().trim().max(300),
  intro: z
    .string()
    .trim()
    .max(2000)
    .refine(hasOnlySiteLinks, 'Links must be addresses on this site that start with /.'),
  sections: z.array(sectionSchema).max(30).refine(hasUniqueIds, 'Two sections share a heading.'),
  faq: z.array(faqItem).max(20),
  related: z.array(relatedLink).max(10),
}

/** A new post is a draft. Only the title is required; the address comes from the title when it is left out. */
export const createPostSchema = z
  .strictObject(postFields)
  .partial()
  .required({ title: true })
  .transform((post) => ({ ...post, slug: post.slug ?? slugify(post.title) }))
  .refine((post) => SLUG.test(post.slug), 'The title needs letters or numbers.')

/** Any field of a post, and its status. Publishing runs the readiness rules in the API. */
export const updatePostSchema = z
  .strictObject({
    ...postFields,
    status: z.enum(['draft', 'published']),
    cover_image_id: z.uuid().nullable(),
  })
  .partial()
  .refine(...hasAtLeastOneField)

const imageFile = {
  content_type: z.enum(BLOG_IMAGE_CONTENT_TYPES),
  size_bytes: z.number().int().min(1).max(MAX_BLOG_IMAGE_BYTES),
}

/** What the browser says it is about to upload; the signed link accepts exactly this file. */
export const createImageUploadSchema = z.strictObject(imageFile)

/** Saves an image once its file is in storage. The pixel size is read in the browser, so the page can reserve room. */
export const addImageSchema = z.strictObject({
  ...imageFile,
  storage_path: z.string().trim().min(3).max(300),
  width: z.number().int().min(1).max(10000),
  height: z.number().int().min(1).max(10000),
  alt_text: z.string().trim().min(1).max(300),
  caption: z.string().trim().min(1).max(300).optional(),
})

/** Change what a picture says about itself. Its file stays as it is. A caption set to null is removed; alt text cannot be. */
export const updateImageSchema = z
  .strictObject({
    alt_text: z.string().trim().min(1).max(300),
    caption: z.string().trim().min(1).max(300).nullable(),
  })
  .partial()
  .refine(...hasAtLeastOneField)
