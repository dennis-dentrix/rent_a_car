import { formatFullDate, readingMinutes } from '@carvo/shared'
import Breadcrumbs from '@/components/Breadcrumbs'
import Button from '@/components/Button'
import ArticleText from '@/components/ArticleText'
import Faq from '@/components/Faq'
import GuideCards from '@/components/GuideCards'
import PostImage from '@/components/PostImage'
import { copy } from '@/copy/en'

const text = copy.blog
const IMAGE_SIZES = '(min-width: 768px) 768px, 100vw'
const IMAGE_CLASS = 'h-auto w-full rounded-panel'

function Picture({ image, isPriority = false }) {
  if (!image) return null
  return (
    <figure>
      <PostImage
        image={image}
        sizes={IMAGE_SIZES}
        isPriority={isPriority}
        className={IMAGE_CLASS}
      />
      {image.caption && (
        <figcaption className="mt-2 text-footnote text-label-2">{image.caption}</figcaption>
      )}
    </figure>
  )
}

/** The list of a page's sections, each linking to its heading. `label` names it ("In this guide" by default). */
export function Contents({ sections, label = text.contents }) {
  return (
    <nav aria-label={label} className="rounded-card bg-bg-grouped p-4 md:p-5">
      <p className="mb-2 text-callout font-semibold">{label}</p>
      <ol className="flex list-decimal flex-col gap-1 pl-5 text-callout">
        {sections.map((section) => (
          <li key={section.id}>
            <a href={`#${section.id}`} className="text-primary hover:underline">
              {section.heading}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

/** One section of a long page: its heading, paragraphs, and an optional list. */
export function Section({ section }) {
  return (
    <section id={section.id} className="scroll-mt-24">
      <h2 className="mb-3 text-title-2 md:text-title-1-lg">{section.heading}</h2>
      <div className="flex flex-col gap-4 text-body text-label-2">
        <Picture image={section.image} />
        {section.paragraphs.map((paragraph) => (
          <p key={paragraph}>
            <ArticleText text={paragraph} />
          </p>
        ))}
        {section.items && (
          <ul className="flex list-disc flex-col gap-2 pl-5">
            {section.items.map((item) => (
              <li key={item}>
                <ArticleText text={item} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

function CallToAct({ links }) {
  return (
    <aside className="rounded-sheet bg-hero p-6 text-on-hero md:p-8">
      <h2 className="text-title-2">{text.ctaTitle}</h2>
      <p className="mt-1 text-body text-on-hero-2">{text.ctaText}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        {links.map((link, index) => (
          <Button key={link.href} href={link.href} variant={index === 0 ? 'light' : 'glass'}>
            {link.label}
          </Button>
        ))}
      </div>
    </aside>
  )
}

/** One article: heading, dates, a contents list, the sections, a call to act, the questions, and more guides. */
export default function ArticleView({ post, trail, more }) {
  return (
    <article className="mx-auto flex w-full max-w-3xl flex-col gap-10">
      <Breadcrumbs trail={trail} />
      <header>
        <h1 className="text-display md:text-display-lg">{post.title}</h1>
        <p className="mt-3 text-footnote text-label-2">
          {text.published} {formatFullDate(post.published_at)} ·{' '}
          {text.readMinutes(readingMinutes(post))}
        </p>
        <p className="mt-5 text-headline font-normal text-label-2">
          <ArticleText text={post.intro} />
        </p>
      </header>
      <Picture image={post.cover} isPriority />
      <Contents sections={post.sections} />
      {post.sections.map((section) => (
        <Section key={section.id} section={section} />
      ))}
      <CallToAct links={post.related} />
      <Faq items={post.faq} />
      {more.length > 0 && (
        <section>
          <h2 className="mb-5 text-title-2 md:text-title-1-lg">{text.moreTitle}</h2>
          <GuideCards posts={more} />
        </section>
      )}
    </article>
  )
}
