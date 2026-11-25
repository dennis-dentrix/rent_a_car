import Button from '@/components/Button'
import GuideCards from '@/components/GuideCards'
import SectionHeading from '@/components/SectionHeading'
import { copy } from '@/copy/en'
import { getPosts } from '@/lib/blog'

const SHOWN = 3

/** The latest guides, under a heading, with a link to all of them. Links the page to the guides for search and readers. */
export default async function GuidesSection() {
  const text = copy.blog
  const posts = (await getPosts()).data ?? []
  if (posts.length === 0) return null
  const seeAll = (
    <Button href={text.path} variant="plain" size="compact" className="shrink-0 whitespace-nowrap">
      {text.homeAll}
    </Button>
  )
  return (
    <section>
      <SectionHeading title={text.homeTitle} action={seeAll} />
      <GuideCards posts={posts.slice(0, SHOWN)} />
    </section>
  )
}
