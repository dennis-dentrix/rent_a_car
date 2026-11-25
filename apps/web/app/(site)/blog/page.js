import Breadcrumbs from '@/components/Breadcrumbs'
import GuideCards from '@/components/GuideCards'
import JsonLd from '@/components/JsonLd'
import { copy } from '@/copy/en'
import { getPosts } from '@/lib/blog'
import { pageMetadata } from '@/lib/seo'
import { breadcrumbJsonLd } from '@/lib/structured-data'

const text = copy.blog

export const metadata = pageMetadata({ ...text.meta, path: text.path })

const TRAIL = [
  { name: copy.classPage.home, path: '/' },
  { name: text.crumb, path: text.path },
]

export default async function BlogPage() {
  const posts = (await getPosts()).data ?? []
  return (
    <div className="flex flex-col gap-8 md:gap-12">
      <JsonLd data={breadcrumbJsonLd(TRAIL)} />
      <Breadcrumbs trail={TRAIL} />
      <header className="max-w-2xl">
        <h1 className="text-display md:text-display-lg">{text.title}</h1>
        <p className="mt-3 text-body text-label-2">{text.subtitle}</p>
      </header>
      {posts.length > 0 ? (
        <GuideCards posts={posts} />
      ) : (
        <p className="text-body text-label-2">{text.empty}</p>
      )}
    </div>
  )
}
