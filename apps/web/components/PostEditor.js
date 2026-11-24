'use client'

import { useState } from 'react'
import { deletePostAction } from '@/app/admin/posts/actions'
import Alert from '@/components/Alert'
import Button from '@/components/Button'
import Dialog from '@/components/Dialog'
import PostBar from '@/components/PostBar'
import PostFields from '@/components/PostFields'
import PostImages from '@/components/PostImages'
import PostPreview from '@/components/PostPreview'
import PostReadiness from '@/components/PostReadiness'
import PostSections from '@/components/PostSections'
import { copy } from '@/copy/en'
import { usePostEditor } from '@/lib/use-post-editor'

const text = copy.editor

function Cancel({ onClose }) {
  return (
    <Button type="button" variant="tonal" onClick={onClose}>
      {text.confirm.cancel}
    </Button>
  )
}

function ConfirmUnpublish({ isOpen, onClose, onGo }) {
  const { confirm } = text
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={confirm.unpublishTitle}
      description={confirm.unpublishText}
      actions={[
        <Cancel key="cancel" onClose={onClose} />,
        <Button key="go" type="button" onClick={onGo}>
          {confirm.unpublish}
        </Button>,
      ]}
    />
  )
}

function ConfirmDelete({ isOpen, onClose, onGo }) {
  const { confirm } = text
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={confirm.deleteTitle}
      description={confirm.deleteText}
      actions={[
        <Cancel key="cancel" onClose={onClose} />,
        <Button key="go" type="button" variant="destructive" onClick={onGo}>
          {confirm.delete}
        </Button>,
      ]}
    />
  )
}

/** Asks before the two things that cannot be taken back with a click: taking a guide off the site, and deleting it. */
function Confirmations({ asking, onClose, editor }) {
  const unpublish = () => {
    onClose()
    editor.unpublish()
  }
  return (
    <>
      <ConfirmUnpublish isOpen={asking === 'unpublish'} onClose={onClose} onGo={unpublish} />
      <ConfirmDelete
        isOpen={asking === 'delete'}
        onClose={onClose}
        onGo={() => deletePostAction(editor.post.id)}
      />
    </>
  )
}

function Problems({ messages }) {
  if (messages.length === 0) return null
  return (
    <Alert tone="error" title={text.readiness.problemsTitle}>
      {messages.join(' ')}
    </Alert>
  )
}

function Writing({ editor }) {
  const { draft, change, images, canChangeSlug } = editor
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
      <div className="flex min-w-0 flex-col gap-8">
        <PostFields draft={draft} change={change} canChangeSlug={canChangeSlug} />
        <PostSections draft={draft} change={change} images={images.images} />
      </div>
      <aside className="flex flex-col gap-6 lg:sticky lg:top-24">
        <PostReadiness draft={draft} />
        <PostImages
          postId={editor.post.id}
          images={images.images}
          coverImageId={draft.coverImageId}
          onUploaded={images.add}
          onCover={(coverImageId) => change({ coverImageId })}
          onUpdate={images.update}
          onRemove={images.remove}
        />
        <Button type="button" variant="destructive" onClick={editor.askDelete}>
          {text.delete}
        </Button>
      </aside>
    </div>
  )
}

/** The guide editor: write on one side, see what is missing and manage pictures on the other, preview in one press. */
export default function PostEditor({ initial }) {
  const editor = usePostEditor(initial)
  const [showPreview, setShowPreview] = useState(false)
  const [asking, setAsking] = useState(null)
  return (
    <div className="flex flex-col gap-6">
      <PostBar
        editor={editor}
        showPreview={showPreview}
        onTogglePreview={() => setShowPreview(!showPreview)}
        onAsk={setAsking}
      />
      <Problems messages={editor.problems} />
      {showPreview ? (
        <PostPreview draft={editor.draft} images={editor.images.images} />
      ) : (
        <Writing editor={{ ...editor, askDelete: () => setAsking('delete') }} />
      )}
      <Confirmations asking={asking} onClose={() => setAsking(null)} editor={editor} />
    </div>
  )
}
