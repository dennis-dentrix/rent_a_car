'use client'

import { SendHorizontal } from 'lucide-react'
import { TYPED_TEXT } from '@/components/Field'
import { copy } from '@/copy/en'
import { cx } from '@/lib/cx'

const text = copy.messages

// Enter sends where there is a keyboard; on a phone it starts a new line, and the button sends.
const isSendKey = (event) =>
  event.key === 'Enter' && !event.shiftKey && window.matchMedia('(pointer: fine)').matches

/** The box at the foot of a chat: it grows with what is typed, and one button sends it. */
export default function ChatComposer({ draft, onDraft, onSend }) {
  const submit = (event) => {
    event.preventDefault()
    onSend(draft)
  }
  const keys = (event) => {
    if (!isSendKey(event)) return
    event.preventDefault()
    onSend(draft)
  }
  return (
    <form onSubmit={submit} className="flex items-end gap-2">
      <textarea
        aria-label={text.label}
        placeholder={text.placeholder}
        value={draft}
        onChange={(event) => onDraft(event.target.value)}
        onKeyDown={keys}
        rows={1}
        maxLength={1000}
        className={cx(
          'max-h-32 min-h-touch flex-1 resize-none rounded-panel border border-separator bg-surface px-4 py-2.5 [field-sizing:content]',
          TYPED_TEXT,
        )}
      />
      <button
        type="submit"
        aria-label={text.send}
        disabled={!draft.trim()}
        className="flex size-12 shrink-0 items-center justify-center rounded-pill bg-primary text-on-primary transition-transform duration-fast active:scale-[0.95] disabled:opacity-40"
      >
        <SendHorizontal size={20} aria-hidden="true" />
      </button>
    </form>
  )
}
