import { formatTime } from '@carvo/shared'
import { copy } from '@/copy/en'
import { cx } from '@/lib/cx'
import { isOwnMessage, withDayBreaks } from '@/lib/messages'

const text = copy.messages

function Bubble({ message, isOwn }) {
  return (
    <li className={cx('flex flex-col gap-1', isOwn ? 'items-end' : 'items-start')}>
      {message.day && (
        <p className="self-center rounded-pill bg-fill px-3 py-1 text-footnote text-label-2">
          {message.day}
        </p>
      )}
      <p
        className={cx(
          'max-w-[80%] whitespace-pre-line break-words rounded-panel px-4 py-2 text-body',
          isOwn
            ? 'rounded-br-md bg-primary text-on-primary'
            : 'rounded-bl-md border border-separator bg-surface text-label',
          message.isSending && 'opacity-60',
        )}
      >
        <span className="sr-only">{isOwn ? `${text.you}: ` : ''}</span>
        {message.body}
      </p>
      <span className="num text-footnote text-label-3">
        {message.isSending ? text.sending : formatTime(message.created_at)}
      </span>
    </li>
  )
}

/** The messages, oldest first: yours to the right, the other side's to the left, with a line for each new day. */
export default function ChatBubbles({ messages, side }) {
  return (
    <ol className="flex flex-col gap-2">
      {withDayBreaks(messages).map((message) => (
        <Bubble key={message.id} message={message} isOwn={isOwnMessage(message, side)} />
      ))}
    </ol>
  )
}
