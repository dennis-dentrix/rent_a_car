import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import PostImage from '@/components/PostImage'
import { copy } from '@/copy/en'

/** Articles as cards that link to them: on the guide index, the home page, and under a service. */
export default function GuideCards({ posts }) {
  return (
    <ul className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
      {posts.map((post) => (
        <li key={post.slug}>
          <Link
            href={`/blog/${post.slug}`}
            className="group flex h-full flex-col overflow-hidden rounded-panel border border-separator bg-surface shadow-1 transition-[transform,box-shadow] duration-standard ease-standard hover:-translate-y-1 hover:shadow-2"
          >
            <PostImage
              image={post.cover}
              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              className="aspect-[16/9] w-full object-cover"
            />
            <div className="flex flex-1 flex-col p-5 md:p-6">
              <p className="text-caption uppercase text-label-2">
                {copy.blog.readMinutes(post.reading_minutes)}
              </p>
              <h3 className="mt-2 text-title-2">{post.title}</h3>
              <p className="mt-2 flex-1 text-callout text-label-2">{post.description}</p>
              <ArrowUpRight
                size={20}
                className="mt-4 text-primary transition-transform duration-standard group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}
