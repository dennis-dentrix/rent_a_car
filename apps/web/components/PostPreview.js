'use client'

import Alert from '@/components/Alert'
import ArticleView from '@/components/ArticleView'
import { copy } from '@/copy/en'
import { previewOf } from '@/lib/post-editor'

/** The guide as a reader will see it, from the text on screen, saved or not. Links in it do nothing harmful here. */
export default function PostPreview({ draft, images }) {
  return (
    <div className="flex flex-col gap-6">
      <Alert tone="info" title={copy.editor.previewNote} />
      <ArticleView post={previewOf(draft, images)} trail={[]} more={[]} />
    </div>
  )
}
