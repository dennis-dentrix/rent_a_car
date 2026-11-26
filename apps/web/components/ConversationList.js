import { MessageSquare } from 'lucide-react'
import Avatar from '@/components/Avatar'
import EmptyState from '@/components/EmptyState'
import InsetList from '@/components/InsetList'
import { copy } from '@/copy/en'
import { conversationTitle, latestFirst, previewText } from '@/lib/messages'

const text = copy.messages

function UnreadDot() {
  return (
    <span className="size-3 shrink-0 rounded-pill bg-error">
      <span className="sr-only">{text.unread}</span>
    </span>
  )
}

const toRow = (conversation, { side, activeId }) => {
  const { title, detail } = conversationTitle(conversation, side)
  const base = side === 'company' ? '/console/messages' : '/account/messages'
  return {
    id: conversation.id,
    href: `${base}/${conversation.id}`,
    title,
    detail,
    preview: previewText(conversation, side),
    isUnread: conversation.is_unread,
    isActive: conversation.id === activeId,
    leading: <Avatar name={title} size={44} />,
    trailing: conversation.is_unread && <UnreadDot />,
  }
}

/** Conversations, latest message first. `side` is 'renter' or 'company': each sees the other's name. */
export default function ConversationList({ conversations, side, activeId }) {
  if (!conversations.length) {
    const message = side === 'company' ? text.companyEmpty : text.renterEmpty
    return <EmptyState icon={MessageSquare} title={text.empty} message={message} />
  }
  const items = latestFirst(conversations).map((entry) => toRow(entry, { side, activeId }))
  return <InsetList items={items} />
}
