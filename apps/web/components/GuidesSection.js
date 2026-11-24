import Button from '@/components/Button'
import Eyebrow from '@/components/Eyebrow'
import GuideCards from '@/components/GuideCards'
import { copy } from '@/copy/en'
import { getPosts } from '@/lib/blog'

const SHOWN = 3

/** The latest guides, under a heading, with a link to all of them. Links the page to the guides for search and readers. */
export default async function GuidesSection() {
  const text = copy.blog
  const posts = (await getPosts()).data ?? []
  if (posts.length === 0) return null
  return (
    <section>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <Eyebrow>{text.homeEyebrow}</Eyebrow>
          <h2 className="text-title-2 md:text-title-1">{text.homeTitle}</h2>
        </div>
        <Button
          href={text.path}
          variant="plain"
          size="compact"
          className="shrink-0 whitespace-nowrap"
        >
          {text.homeAll}
        </Button>
      </div>
      <GuideCards posts={posts.slice(0, SHOWN)} />
    </section>
  )
}
