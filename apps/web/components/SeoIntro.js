import ArticleText from '@/components/ArticleText'
import SectionHeading from '@/components/SectionHeading'
import { copy } from '@/copy/en'

/** A short plain-language introduction under the first screen, written for readers and for the terms people search. */
export default function SeoIntro() {
  const { title, paragraphs } = copy.home.seoIntro
  return (
    <section>
      <SectionHeading title={title} className="mb-4" />
      <div className="flex max-w-prose flex-col gap-3 text-reading text-label-2">
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>
            <ArticleText text={paragraph} />
          </p>
        ))}
      </div>
    </section>
  )
}
