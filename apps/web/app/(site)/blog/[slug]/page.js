import { notFound } from 'next/navigation'
import ArticleView from '@/components/ArticleView'
import JsonLd from '@/components/JsonLd'
import LoadError from '@/components/LoadError'
import { copy } from '@/copy/en'
import { getPostBySlug, getPosts, otherPosts, postImageUrl } from '@/lib/blog'
import { pageMetadata } from '@/lib/seo'
import { articleJsonLd, breadcrumbJsonLd, faqJsonLd } from '@/lib/structured-data'

const text = copy.blog
const pathFor = (slug) => `${text.path}/${slug}`

const trailFor = (post) => [
  { name: copy.classPage.home, path: '/' },
  { name: text.crumb, path: text.path },
  { name: post.title, path: pathFor(post.slug) },
]

// The share picture is the guide's cover when it has one, at its own size.
const shareImage = (cover) => {
  const url = postImageUrl(cover)
  return url ? { url, width: cover.width, height: cover.height, alt: cover.alt_text } : undefined
}

// Known guides are built ahead of time; one published later is built the first time it is asked for.
export async function generateStaticParams() {
  return ((await getPosts()).data ?? []).map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }) {
  const result = await getPostBySlug((await params).slug)
  if (!result.post)
    return { title: result.isMissing ? text.notFound : text.eyebrow, robots: { index: false } }
  const { post } = result
  return pageMetadata({
    title: post.title,
    description: post.description,
    path: pathFor(post.slug),
    image: shareImage(post.cover),
  })
}

export default async function ArticlePage({ params }) {
  const { slug } = await params
  const result = await getPostBySlug(slug)
  if (result.isMissing) notFound()
  if (result.error) return <LoadError text={text} href={pathFor(slug)} />
  const { post } = result
  const more = otherPosts((await getPosts()).data ?? [], post)
  return (
    <>
      <JsonLd
        data={articleJsonLd({
          ...post,
          path: pathFor(post.slug),
          published: post.published_at,
          updated: post.updated_at,
          imageUrl: postImageUrl(post.cover) ?? undefined,
        })}
      />
      <JsonLd data={faqJsonLd(post.faq)} />
      <JsonLd data={breadcrumbJsonLd(trailFor(post))} />
      <ArticleView post={post} trail={trailFor(post)} more={more} />
    </>
  )
}
