import ArticleText from '@/components/ArticleText'
import { copy } from '@/copy/en'

/** A short plain-language introduction under the first screen, written for readers and for the terms people search. */
export default function SeoIntro() {
  const { title, paragraphs } = copy.home.seoIntro
  return (
    <section className="mx-auto w-full max-w-3xl">
      <h2 className="text-title-2 md:text-title-1">{title}</h2>
      <div className="mt-3 flex flex-col gap-3 text-body text-label-2">
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>
            <ArticleText text={paragraph} />
          </p>
        ))}
      </div>
    </section>
  )
}
