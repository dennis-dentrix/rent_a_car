import ConversationList from '@/components/ConversationList'
import Panel from '@/components/Panel'
import { copy } from '@/copy/en'
import { latestFirst } from '@/lib/messages'

const SHOWN = 3

/** Renters whose messages have not been read. Nothing is shown when there are none. */
export default function TodayMessages({ conversations }) {
  const unread = latestFirst(conversations.filter((conversation) => conversation.is_unread))
  if (!unread.length) return null
  return (
    <Panel title={copy.today.messages}>
      <ConversationList conversations={unread.slice(0, SHOWN)} side="company" />
    </Panel>
  )
}
