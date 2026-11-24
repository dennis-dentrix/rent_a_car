'use client'

import { Check, X } from 'lucide-react'
import { readingMinutes, wordCount } from '@rent-a-car/shared/posts'
import { copy } from '@/copy/en'
import { payloadFromDraft, readinessOf } from '@/lib/post-editor'

const text = copy.editor.readiness

/** What still stands between this guide and publishing, worked out from the text on screen as it is typed. */
export default function PostReadiness({ draft }) {
  const problems = readinessOf(draft)
  const body = payloadFromDraft(draft)
  return (
    <section className="flex flex-col gap-2 rounded-card bg-bg-grouped p-4">
      <h2 className="text-headline">{text.title}</h2>
      <p className="text-footnote text-label-2">
        {text.words(wordCount(body), readingMinutes(body))}
      </p>
      {problems.length === 0 ? (
        <p className="flex items-center gap-2 text-callout text-success">
          <Check size={18} aria-hidden="true" />
          {text.ready}
        </p>
      ) : (
        <ul className="flex flex-col gap-1">
          {problems.map((problem) => (
            <li key={problem.message} className="flex items-start gap-2 text-callout">
              <X size={18} className="mt-0.5 shrink-0 text-error" aria-hidden="true" />
              {problem.message}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
