import Link from 'next/link'
import { splitLinks } from '@rent-a-car/shared'

/** A sentence from an article, with its links to other pages on this site drawn as links. */
export default function ArticleText({ text }) {
  return splitLinks(text).map((part, index) =>
    part.type === 'link' ? (
      <Link
        key={index}
        href={part.href}
        className="font-medium text-primary underline underline-offset-2"
      >
        {part.text}
      </Link>
    ) : (
      <span key={index}>{part.text}</span>
    ),
  )
}
