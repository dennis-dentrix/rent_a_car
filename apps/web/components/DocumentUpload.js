'use client'

import { attempt } from '@/lib/attempt'
import { useRef, useState } from 'react'
import { DOCUMENT_CONTENT_TYPES } from '@carvo/shared'
import Button from '@/components/Button'
import { copy } from '@/copy/en'
import { uploadDocument } from '@/lib/document-upload'

const text = copy.trip

/** One button to send a file. Choosing it sends it at once: there is nothing else to fill in. */
export default function DocumentUpload({ bookingId, type, label }) {
  const input = useRef(null)
  const [state, setState] = useState({ isBusy: false, error: '' })
  const choose = async (event) => {
    const file = event.target.files[0]
    if (!file) return
    setState({ isBusy: true, error: '' })
    const { error } = await attempt(() => uploadDocument(file, { bookingId, type }), {
      error: 'upload',
    })
    input.current.value = ''
    setState({ isBusy: false, error: error ? text.errors[error] : '' })
  }
  return (
    <div className="flex flex-col items-end gap-1">
      <input
        ref={input}
        type="file"
        accept={DOCUMENT_CONTENT_TYPES.join(',')}
        onChange={choose}
        className="hidden"
        aria-label={`${label}: ${text.tasks[type]}`}
      />
      <Button
        type="button"
        variant="tonal"
        size="compact"
        isLoading={state.isBusy}
        onClick={() => input.current.click()}
      >
        {state.isBusy ? text.uploading : label}
      </Button>
      {state.error && <p className="text-footnote text-error">{state.error}</p>}
    </div>
  )
}
