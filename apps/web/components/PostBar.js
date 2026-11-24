'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { formatTime } from '@rent-a-car/shared'
import Badge from '@/components/Badge'
import Button from '@/components/Button'
import { copy } from '@/copy/en'

const text = copy.editor

function stateLabel(saveState, isDirty) {
  if (saveState.kind === 'saving') return text.state.saving
  if (saveState.kind === 'failed') return text.state.failed
  if (isDirty) return text.state.unsaved
  return saveState.kind === 'saved' ? text.state.saved(formatTime(saveState.at)) : ''
}

/** The label of the status badge. While the server has not answered, it says what is being asked, never what it hopes for. */
function statusLabel(post, pendingStatus) {
  if (pendingStatus === 'publishing') return text.publishing
  if (pendingStatus === 'unpublishing') return text.unpublishing
  return post.status === 'published' ? text.published : text.draft
}

function BarButtons({ editor, showPreview, onTogglePreview, onAsk }) {
  const isBusy = Boolean(editor.pendingStatus) || editor.saveState.kind === 'saving'
  return (
    <div className="ml-auto flex flex-wrap gap-2">
      <Button type="button" variant="tonal" size="compact" onClick={onTogglePreview}>
        {showPreview ? text.edit : text.preview}
      </Button>
      <Button
        type="button"
        variant="tonal"
        size="compact"
        disabled={isBusy}
        onClick={() => editor.save()}
      >
        {text.save}
      </Button>
      {editor.post.status === 'published' ? (
        <Button
          type="button"
          variant="plain"
          size="compact"
          disabled={isBusy}
          onClick={() => onAsk('unpublish')}
        >
          {text.unpublish}
        </Button>
      ) : (
        <Button type="button" size="compact" disabled={isBusy} onClick={() => editor.publish()}>
          {text.publish}
        </Button>
      )}
    </div>
  )
}

/** The top of the editor, kept in view: where you are, what state the guide is in, and what you can do with it. */
export default function PostBar(props) {
  const { post, saveState, isDirty, pendingStatus } = props.editor
  const isLive = post.status === 'published' && !pendingStatus
  return (
    <div className="sticky top-0 z-header -mx-4 flex flex-wrap items-center gap-3 border-b border-separator bg-bg/95 px-4 py-3 backdrop-blur md:mx-0 md:rounded-card md:border">
      <Link
        href="/admin/posts"
        className="inline-flex items-center gap-1 text-callout font-medium text-primary"
      >
        <ArrowLeft size={18} aria-hidden="true" />
        {text.back}
      </Link>
      <Badge tone={isLive ? 'success' : 'neutral'}>{statusLabel(post, pendingStatus)}</Badge>
      <p aria-live="polite" className="text-footnote text-label-2">
        {stateLabel(saveState, isDirty)}
      </p>
      <BarButtons {...props} />
    </div>
  )
}
