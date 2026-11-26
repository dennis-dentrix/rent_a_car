import { replyAction } from '@/app/messages/actions'
import ChatContext from '@/components/ChatContext'
import ChatScreen from '@/components/ChatScreen'
import ChatThread from '@/components/ChatThread'
import LivePoll from '@/components/LivePoll'
import MarkRead from '@/components/MarkRead'
import { conversationTitle } from '@/lib/messages'

const EVERY_MS = 5000

/** One conversation, for either side. New messages from the other side appear within a few seconds. */
export default function ConversationScreen({ conversation, conversations, side, action }) {
  const backHref = side === 'company' ? '/console/messages' : '/account/messages'
  return (
    <>
      <ChatScreen
        list={{ conversations, side, activeId: conversation.id }}
        heading={{ ...conversationTitle(conversation, side), backHref, action }}
        context={<ChatContext conversation={conversation} side={side} />}
      >
        <ChatThread
          key={conversation.id}
          messages={conversation.messages}
          side={side}
          action={replyAction}
          hidden={{ conversation_id: conversation.id }}
        />
      </ChatScreen>
      <MarkRead id={conversation.id} lastMessageAt={conversation.last_message_at} />
      <LivePoll everyMs={EVERY_MS} />
    </>
  )
}
