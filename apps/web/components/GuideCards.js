import Link from 'next/link'
import PostImage from '@/components/PostImage'
import { copy } from '@/copy/en'

/** Articles, each a picture over its title: on the guide index, the home page, and under a service. */
export default function GuideCards({ posts }) {
  return (
    <ul className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <li key={post.slug}>
          <Link href={`/blog/${post.slug}`} className="group flex h-full flex-col">
            <PostImage
              image={post.cover}
              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              className="aspect-[16/9] w-full rounded-panel object-cover"
            />
            <h3 className="mt-4 text-headline underline-offset-4 group-hover:underline md:text-title-2">
              {post.title}
            </h3>
            <p className="mt-2 text-reading text-label-2">{post.description}</p>
            <p className="mt-2 text-footnote text-label-2">
              {copy.blog.readMinutes(post.reading_minutes)}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  )
}
