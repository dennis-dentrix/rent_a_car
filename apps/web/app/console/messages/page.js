import AdminPage from '@/components/AdminPage'
import ConversationList from '@/components/ConversationList'
import { copy } from '@/copy/en'
import { consoleGet, requireOperator } from '@/lib/console'

export const metadata = { title: copy.messages.title }

export default async function ConsoleMessagesPage() {
  const { token } = await requireOperator()
  const { data, error } = await consoleGet('/messages', token)
  return (
    <AdminPage isNarrow title={copy.messages.title} hasError={Boolean(error)}>
      {data && <ConversationList conversations={data} side="company" />}
    </AdminPage>
  )
}
