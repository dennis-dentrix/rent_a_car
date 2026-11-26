import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import Avatar from '@/components/Avatar'
import ConversationList from '@/components/ConversationList'
import { copy } from '@/copy/en'

// A phone gives the chat the whole screen; a wide screen keeps the other conversations beside it.
const FRAME =
  'fixed inset-0 z-sheet flex flex-col overflow-hidden bg-surface lg:static lg:z-auto lg:grid lg:h-[calc(100dvh-11rem)] lg:min-h-[28rem] lg:grid-cols-[20rem_1fr] lg:rounded-panel lg:border lg:border-separator lg:shadow-1'

function Heading({ title, detail, backHref, action }) {
  return (
    <header className="pt-safe flex items-center gap-3 border-b border-separator px-3 py-2">
      <Link
        href={backHref}
        aria-label={copy.messages.back}
        className="flex min-h-touch min-w-touch items-center justify-center rounded-pill text-primary lg:hidden"
      >
        <ChevronLeft size={24} aria-hidden="true" />
      </Link>
      <Avatar name={title} size={40} />
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-headline">{title}</h1>
        <p className="truncate text-footnote text-label-2">{detail}</p>
      </div>
      {action}
    </header>
  )
}

/**
 * A chat page for either side. `list` is the other conversations and which side is looking; `heading` is who and
 * what this one is about; `children` is the thread.
 */
export default function ChatScreen({ list, heading, context, children }) {
  return (
    <div className={FRAME}>
      <aside className="hidden overflow-y-auto border-r border-separator p-3 lg:block">
        <p className="px-1 pb-3 text-title-2">{copy.messages.title}</p>
        <ConversationList {...list} />
      </aside>
      <section className="flex min-h-0 flex-1 flex-col">
        <Heading {...heading} />
        {context}
        {children}
      </section>
    </div>
  )
}
