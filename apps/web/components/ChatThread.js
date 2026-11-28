'use client'

import { attempt } from '@/lib/attempt'
import { useEffect, useOptimistic, useRef, useState, useTransition } from 'react'
import ChatBubbles from '@/components/ChatBubbles'
import ChatComposer from '@/components/ChatComposer'
import { copy } from '@/copy/en'

const text = copy.messages

const asForm = (values) => {
  const form = new FormData()
  Object.entries(values).forEach(([name, value]) => value && form.set(name, value))
  return form
}

// A message shows the moment it is sent; if the server refuses it, it goes back into the box with the reason.
function useSending({ messages, side, action, hidden }) {
  const [shown, addSending] = useOptimistic(messages, (list, message) => [...list, message])
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')
  const [, startSending] = useTransition()
  const send = (typed) => {
    const body = typed.trim()
    if (!body) return
    setDraft('')
    setError('')
    startSending(async () => {
      const sent = { id: 'sending', body, isSending: true, is_from_company: side === 'company' }
      addSending({ ...sent, created_at: new Date().toISOString() })
      const result = await attempt(() => action(null, asForm({ ...hidden, body })))
      if (!result?.error) return
      setDraft(body)
      setError(result.error)
    })
  }
  return { shown, draft, setDraft, error, send }
}

// Ready-made first questions, offered while nothing has been said.
function Suggestions({ items, onPick }) {
  return (
    <ul className="flex flex-wrap justify-center gap-2">
      {items.map((item) => (
        <li key={item}>
          <button
            type="button"
            onClick={() => onPick(item)}
            className="min-h-touch rounded-pill border border-separator bg-surface px-4 text-callout text-primary"
          >
            {item}
          </button>
        </li>
      ))}
    </ul>
  )
}

/** The scrolling messages with the box to write in under them. The newest message is always brought into view. */
export default function ChatThread({ suggestions = [], ...chat }) {
  const { shown, draft, setDraft, error, send } = useSending(chat)
  const end = useRef(null)
  // A block body: newer browsers return a value from scrollIntoView, which React would take for a clean-up.
  useEffect(() => {
    end.current?.scrollIntoView({ block: 'end' })
  }, [shown.length])
  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain bg-bg-grouped px-4 py-4">
        <div className="mt-auto flex flex-col gap-4">
          <ChatBubbles messages={shown} side={chat.side} />
          {!shown.length && <Suggestions items={suggestions} onPick={send} />}
        </div>
        <div ref={end} />
      </div>
      <div className="pb-safe flex flex-col gap-1 border-t border-separator bg-surface px-3 pt-2">
        {error && (
          <p role="alert" className="text-footnote text-error">
            {error}
          </p>
        )}
        <ChatComposer draft={draft} onDraft={setDraft} onSend={send} />
        <p className="pb-2 text-center text-footnote text-label-3">{text.helper}</p>
      </div>
    </>
  )
}
