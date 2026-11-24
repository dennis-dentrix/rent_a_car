# Content Management: Blog and Guides

How guides are written, stored, published, and shown, and how their images are handled. This document owns those facts. Growth reasons for the guides (terms, order, markup) stay in `growth-seo.md`.

## 1. Decisions

| Decision | Ruling | Why |
| --- | --- | --- |
| Where guides live | A `posts` table in Supabase, read and written through the API | One source of truth, no new vendor, publish without a deploy. The web app never queries the database, so it reads `GET /posts`. |
| Who writes | Admin only for now (`/admin/posts`) | Admin already needs a second factor, and every change is in the audit log. Staff access is a one-line policy change later. |
| Shape of a guide | Structured fields, not free Markdown: intro, sections (heading, paragraphs, list items, optional image), FAQ, related links | The FAQ feeds `FAQPage` markup, the section headings feed the contents list, and a test already checks the keyword rule. Free text would lose all three. |
| Links in text | `[text](/path)` to pages on this site only | Unchanged from the file-based guides. The schema refuses any other address. |
| Images | Public R2 bucket on the media address; the browser uploads straight to it on a signed link | Search engines and social previews must fetch them. Identity documents stay in the private bucket. |
| Resizing | `next/image` resizes on demand and caches | No extra cost. Cloudflare Image Resizing stays an option if the VM is loaded. |
| Freshness | The public pages revalidate every 60 seconds | A published guide shows within a minute with no deploy. |

## 2. Data

`posts`

| Column | Notes |
| --- | --- |
| `id`, `created_at`, `updated_at` | Standard. |
| `slug` | Unique, lowercase words joined by hyphens. The address is `/blog/{slug}`. Never changed after publishing, because the address is indexed. |
| `keyword` | The main search term. Must appear in the title and the opening paragraph before publishing. |
| `title`, `description`, `intro` | Text. |
| `sections` | JSON array of `{ id, heading, paragraphs[], items[]?, image_id? }`. |
| `faq` | JSON array of `{ q, a }`. |
| `related` | JSON array of `{ label, href }`, site addresses only. They become the buttons under the article. |
| `cover_image_id` | Optional, one of the post's own images. Used on cards, the article header, `Article` markup, and the share preview. |
| `status` | `draft` or `published`. |
| `published_at` | Set the first time a post is published; kept when it is unpublished and published again. |
| `created_by` | The admin who created it. |

`post_images`: `id`, `post_id` (cascade delete), `storage_path` (unique), `content_type`, `size_bytes`, `width`, `height`, `alt_text` (required), `caption`, `created_at`.

Indexes (same migration): the public list `(status, published_at desc, id desc)`; the admin list `(created_at desc, id desc)`; images by `(post_id, created_at desc, id desc)`. The slug lookup uses the unique index.

Row Level Security: anyone reads a published post and the images of a published post; admin reads and writes everything. Changes to `posts` are written to `audit_log`.

## 3. API

Public (no sign-in, cached at the edge for one minute):

- `GET /posts`: published posts, newest first, summary fields and the cover image.
- `GET /posts/{slug}`: one published post, with every image it uses resolved to `{ id, storage_path, alt_text, width, height, caption }` (the page joins `storage_path` to the media address). The card list carries `reading_minutes` and the cover, never the body. Images are fetched in one query, never one per section.

Admin (sign-in, role admin, second factor):

- `GET /admin/posts`, `GET /admin/posts/{id}`, `POST /admin/posts`, `PATCH /admin/posts/{id}`: list (cursor, newest first), read, create, and change a post. Changing `status` to `published` runs the checks in section 5.
- `DELETE /admin/posts/{id}`: removes the post and every one of its image files in one batch.
- `POST /admin/posts/{id}/image-uploads`: returns a signed upload link for one image.
- `POST /admin/posts/{id}/images`: after the upload, checks the stored file and saves the image with its alt text.
- `DELETE /admin/posts/{id}/images/{imageId}`: removes the record and the file; a cover or section that used it loses the image.

New error code: none. A refused publish uses `VALIDATION_FAILED` (400) with each problem in `details`, one entry per field.

## 4. Images

1. The editor reads the file's type, size, and pixel size in the browser, then asks for an upload link.
2. The browser sends the file to the public bucket on that link. The type and exact size are part of the signature.
3. The editor tells the API the upload is done, with the alt text. The API reads the stored file, refuses one whose first bytes do not match the declared type, deletes it, and otherwise saves the record.
4. The key is `blog/{post_id}/{image_id}.{ext}`. Anything under `blog/` is kept in the public bucket; everything else stays private. One function picks the bucket from the key.
5. Allowed: JPEG, PNG, WebP, up to 5 MB. SVG is refused because it can carry scripts.
6. The page shows each image with `next/image` using the stored width and height (no layout shift). The cover and the first section image load with priority only when they sit above the fold.

Alt text is required to save an image. A cover image is recommended before publishing, not required.

## 5. Publishing rules

A draft may be incomplete. Before a post is published the shared package (`packages/shared/src/post-checks.js`) must find none of these problems, and the editor shows the same list as warnings while writing:

- The keyword is in the title and in the opening paragraph.
- The title is at most 75 characters; the description is 80 to 165 characters.
- At least 3 questions in the FAQ.
- At least 350 words in the body.
- Every `image_id` and the cover belong to this post.
- At least one related link.

These are the rules the unit test in `apps/web/lib/blog.test.js` used to check on the four files. They now live in one place, apply to every post, and a published post must keep passing them when it is edited.

## 6. Web app

- `lib/blog.js` reads from the API (`apiGet`, 60-second revalidation). The pure helpers (reading time, word count, link splitting) live in `packages/shared/src/posts.js`, next to the publishing rules, so the API and the page cannot disagree.
- `/blog`, `/blog/{slug}`, the home page guide cards, and the sitemap read the same list. If the API does not answer, the pages show their plain empty state and the sitemap lists the fixed pages only.
- `NEXT_PUBLIC_MEDIA_BASE_URL` is the public address of the bucket; `next.config.mjs` already allows it for `next/image`.
- The four guides already written moved into the database through the data migration `20261124000002_seed_guides.sql`, still published as they were; `apps/web/copy/blog/` keeps only the page wording (`blogCopy`).

## 7. Setup (once per environment)

1. Create a second R2 bucket, public through a custom domain such as `media.example.com`. Set CORS to allow `PUT` from the web origin only.
2. API: `R2_PUBLIC_BUCKET` (the bucket name). The same R2 keys serve both buckets.
3. Web: `NEXT_PUBLIC_MEDIA_BASE_URL` (the custom domain).
4. Locally, the second bucket is a public bucket in the local Supabase storage.

## 8. Tests

One rule, one test, at the layer that owns it.

| Rule | Where |
| --- | --- |
| Readiness checks, slug and link rules, reading time, link splitting, what the schemas accept | `packages/shared/src/posts.test.js` |
| WebP and other file signatures | `apps/api/src/lib/file-sniff.test.js` |
| Public sees only published posts and their images; only admin writes; the publication date; the locked address; the cover rule; the audit log | `tests/integration/posts.test.js` (database) |
| Routes: auth, status codes, a refused publish, an image that is not what it claims, an image saved against the wrong post, removal | `tests/integration/posts-api.test.js` |

The database and API tests are two files for one area, as with `fleet.test.js` and `fleet-api.test.js`.

## 9. Editor screens

Every admin call carries the admin's token, so the editor depends on web sign-in. That is now built (24 November 2026, `technical-architecture.md` section "Login between the two"): `/auth`, `/auth/verify`, `/auth/enrol`, the `requireRole` guard, and an `/admin` area that only an admin who has used a second factor can open. Build order:

1. Done: database, shared rules, API, and the public pages. The first end-to-end check uploaded a real picture through the signed link to the local public bucket and showed it on the article page through `next/image`.
2. Done: web sign-in with the second factor.
3. Done (24 November 2026): the editor at `/admin/posts` (`apps/web/components/Post*.js`, `lib/post-editor.js`, `lib/use-post-editor.js`). The list shows every guide with its state; a new guide starts from a title. The editor has the text fields, sections, questions, and links (add, remove, reorder), a readiness list that updates as you type, a preview of the real article page, a cover and a section picture picked from the uploaded ones, and picture upload straight to the public bucket with required alt text. A picture's description and caption can be changed afterwards (`PATCH /admin/posts/{id}/images/{imageId}`); its file cannot.
   - **Saving:** the screen says "Unsaved changes", "Saving…", then "Saved 10:42". Closing the tab with unsaved writing asks first. A half-finished row (a section with no paragraph) is named and blocks the save; a draft may otherwise be unfinished.
   - **Publishing:** the badge reads "Publishing…" until the server answers; a refusal puts the badge back and lists every problem. Unpublishing and deleting ask first. A removed picture leaves the list at once and comes back with a message if the server refuses.
   - **Not in the editor yet:** a visual rich-text editor, and instant refresh of the public pages after publishing (they refresh within a minute).

Gate (checked in the browser, 24 November 2026, except the two-image guide): an admin writes a guide with two images, publishes it, and sees it on `/blog` within a minute; the sitemap lists it; a refused publish names every problem.
