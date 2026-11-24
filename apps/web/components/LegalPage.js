import AskButton from '@/components/AskButton'
import { Contents, Section } from '@/components/ArticleView'
import Breadcrumbs from '@/components/Breadcrumbs'
import Eyebrow from '@/components/Eyebrow'
import { copy } from '@/copy/en'

/**
 * A long, plain page of legal text (the privacy policy, later the terms): heading, date, a contents list, the
 * sections, and a way to write to us. `text` is one of the copy files shaped like copy/privacy.js.
 */
export default function LegalPage({ text }) {
  const trail = [
    { name: copy.classPage.home, path: '/' },
    { name: text.crumb, path: text.path },
  ]
  return (
    <article className="mx-auto flex w-full max-w-3xl flex-col gap-10">
      <Breadcrumbs trail={trail} />
      <header>
        <Eyebrow>{text.eyebrow}</Eyebrow>
        <h1 className="text-display md:text-display-lg">{text.title}</h1>
        <p className="mt-3 text-footnote text-label-2">{text.updated}</p>
        <p className="mt-5 text-headline font-normal text-label-2">{text.intro}</p>
      </header>
      <Contents sections={text.sections} label={text.contents} />
      {text.sections.map((section) => (
        <Section key={section.id} section={section} />
      ))}
      <aside className="rounded-card bg-bg-grouped p-5 md:p-6">
        <h2 className="text-title-2">{text.contact.title}</h2>
        <p className="mt-1 text-body text-label-2">{text.contact.text}</p>
        <div className="mt-4">
          <AskButton variant="tonal" isFullWidth={false} defaultMessage={text.contact.message}>
            {text.contact.button}
          </AskButton>
        </div>
      </aside>
    </article>
  )
}
