'use client'

import { useEffect, useMemo, useState } from 'react'
import { Check } from 'lucide-react'
import Alert from '@/components/Alert'
import Button from '@/components/Button'
import TextField from '@/components/Field'
import PostImage from '@/components/PostImage'
import PostImageText from '@/components/PostImageText'
import { copy } from '@/copy/en'
import { uploadPostImage } from '@/lib/post-images'

const text = copy.editor.images
const EMPTY = { file: null, altText: '', caption: '' }

/** The picture chosen so far, drawn small from the file itself, before anything is sent. */
function Chosen({ file }) {
  const preview = useMemo(() => URL.createObjectURL(file), [file])
  useEffect(() => () => URL.revokeObjectURL(preview), [preview])
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={preview} alt="" className="h-24 w-full rounded-control bg-fill object-cover" />
  )
}

const IDLE = { isBusy: false, error: '', altError: '' }

/** The state of the upload form and what pressing Upload does. The description is checked first, before anything is sent. */
function useUploadForm({ postId, onUploaded }) {
  const [form, setForm] = useState(EMPTY)
  const [state, setState] = useState(IDLE)
  // Counts finished uploads, so the file box is drawn fresh after one and does not still name the file just sent.
  const [round, setRound] = useState(0)
  const submit = async (event) => {
    event.preventDefault()
    if (!form.altText.trim()) return setState({ ...IDLE, altError: text.errors.alt })
    setState({ ...IDLE, isBusy: true })
    const result = await uploadPostImage({ postId, ...form })
    if (result.error) return setState({ ...IDLE, error: text.errors[result.error] })
    onUploaded(result.image)
    setForm(EMPTY)
    setRound(round + 1)
    return setState(IDLE)
  }
  const choose = (event) => {
    setForm({ ...form, file: event.target.files[0] ?? null })
    setState(IDLE)
  }
  return { form, setForm, state, submit, choose, round }
}

function UploadFields({ form, setForm, state }) {
  return (
    <>
      <Chosen file={form.file} />
      <TextField
        label={text.alt}
        value={form.altText}
        onChange={(e) => setForm({ ...form, altText: e.target.value })}
        helper={text.altHelper}
        error={state.altError}
        maxLength={300}
      />
      <TextField
        label={text.caption}
        value={form.caption}
        onChange={(e) => setForm({ ...form, caption: e.target.value })}
        maxLength={300}
      />
      <Button type="submit" isLoading={state.isBusy}>
        {state.isBusy ? text.uploading : text.upload}
      </Button>
    </>
  )
}

/** Choose a picture, say what it shows, send it. The description is required: it is read to people who cannot see it. */
function Uploader(props) {
  const { form, setForm, state, submit, choose, round } = useUploadForm(props)
  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-3 rounded-card border border-separator p-3"
    >
      <input
        key={round}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        aria-label={text.choose}
        onChange={choose}
      />
      <p className="text-footnote text-label-2">{text.types}</p>
      {state.error && <Alert tone="error" title={state.error} />}
      {form.file && <UploadFields form={form} setForm={setForm} state={state} />}
    </form>
  )
}

function TileButtons({ isCover, onCover, onEdit, onRemove }) {
  return (
    <div className="mt-1 flex flex-wrap gap-2">
      <Button
        type="button"
        size="compact"
        variant={isCover ? 'primary' : 'tonal'}
        aria-pressed={isCover}
        onClick={onCover}
      >
        {isCover && <Check size={16} aria-hidden="true" />}
        {isCover ? text.cover : text.makeCover}
      </Button>
      <Button type="button" size="compact" variant="tonal" onClick={onEdit}>
        {text.edit}
      </Button>
      <Button type="button" size="compact" variant="plain" onClick={onRemove}>
        {text.remove}
      </Button>
    </div>
  )
}

function ImageTile({ image, isCover, onCover, onUpdate, onRemove }) {
  const [isEditing, setIsEditing] = useState(false)
  return (
    <li className="flex items-start gap-3">
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-control bg-fill">
        <PostImage image={image} sizes="64px" className="h-full w-full object-cover" />
      </div>
      {isEditing ? (
        <PostImageText image={image} onSave={onUpdate} onDone={() => setIsEditing(false)} />
      ) : (
        <div className="min-w-0 flex-1">
          <p className="truncate text-callout">{image.alt_text}</p>
          <TileButtons
            isCover={isCover}
            onCover={onCover}
            onEdit={() => setIsEditing(true)}
            onRemove={onRemove}
          />
        </div>
      )}
    </li>
  )
}

/** The pictures uploaded for this guide, the cover, and a way to add more. A removed picture is gone from the list at once. */
export default function PostImages({
  postId,
  images,
  coverImageId,
  onUploaded,
  onCover,
  onUpdate,
  onRemove,
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-title-2">{text.title}</h2>
      {images.length === 0 && <p className="text-callout text-label-2">{text.empty}</p>}
      <ul className="flex flex-col gap-3">
        {images.map((image) => (
          <ImageTile
            key={image.id}
            image={image}
            isCover={image.id === coverImageId}
            onCover={() => onCover(image.id === coverImageId ? '' : image.id)}
            onUpdate={(changes) => onUpdate(image.id, changes)}
            onRemove={() => onRemove(image.id)}
          />
        ))}
      </ul>
      <Uploader postId={postId} onUploaded={onUploaded} />
    </section>
  )
}
