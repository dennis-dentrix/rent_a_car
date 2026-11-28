'use client'

import './globals.css'
import { copy } from '@/copy/en'

const text = copy.errors.page

// Replaces the whole document when the root layout itself fails, so it brings its own and depends on nothing else.
export default function GlobalError({ reset }) {
  return (
    <html lang="en-KE" data-theme="light">
      <body className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-bg px-6 text-center text-label">
        <h1 className="text-title-2">{text.title}</h1>
        <p className="text-callout text-label-2">{text.text}</p>
        <button
          type="button"
          onClick={reset}
          className="min-h-touch rounded-control bg-primary px-6 font-semibold text-on-primary"
        >
          {text.retry}
        </button>
      </body>
    </html>
  )
}
