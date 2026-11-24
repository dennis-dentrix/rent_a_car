'use client'

import { useState } from 'react'
import Alert from '@/components/Alert'
import Button from '@/components/Button'
import TextField from '@/components/Field'
import { copy } from '@/copy/en'

const text = copy.editor.images

/**
 * Change what a picture says about itself: its description (required) and caption. The file is not touched. The form
 * stays open, saying "saving", until the server has kept the change; if it refuses, the old text is still what shows.
 */
export default function PostImageText({ image, onSave, onDone }) {
  const [altText, setAltText] = useState(image.alt_text)
  const [caption, setCaption] = useState(image.caption ?? '')
  const [state, setState] = useState({ isBusy: false, altError: '', error: '' })

  const submit = async (event) => {
    event.preventDefault()
    if (!altText.trim()) return setState({ isBusy: false, altError: text.errors.alt, error: '' })
    setState({ isBusy: true, altError: '', error: '' })
    const isSaved = await onSave({ alt_text: altText.trim(), caption: caption.trim() || null })
    if (isSaved) return onDone()
    return setState({ isBusy: false, altError: '', error: text.errors.update })
  }

  return (
    <form onSubmit={submit} className="flex min-w-0 flex-1 flex-col gap-3">
      {state.error && <Alert tone="error" title={state.error} />}
      <TextField
        label={text.alt}
        value={altText}
        onChange={(e) => setAltText(e.target.value)}
        error={state.altError}
        maxLength={300}
      />
      <TextField
        label={text.caption}
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        maxLength={300}
      />
      <div className="flex gap-2">
        <Button type="submit" size="compact" isLoading={state.isBusy}>
          {state.isBusy ? text.saving : text.saveText}
        </Button>
        <Button type="button" size="compact" variant="tonal" onClick={onDone}>
          {text.cancel}
        </Button>
      </div>
    </form>
  )
}
