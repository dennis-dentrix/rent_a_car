import Alert from '@/components/Alert'
import ConversationScreen from '@/components/ConversationScreen'
import { copy } from '@/copy/en'
import { consoleGet, loadForOperator, requireOperator } from '@/lib/console'

export const metadata = { title: copy.messages.title }

export default async function ConsoleConversationPage({ params }) {
  const { id } = await params
  const { token } = await requireOperator()
  const [{ data }, all] = await Promise.all([
    loadForOperator(`/messages/${encodeURIComponent(id)}`),
    consoleGet('/messages', token),
  ])
  if (!data) return <Alert tone="error" title={copy.admin.loadError} />
  return <ConversationScreen conversation={data} conversations={all.data ?? []} side="company" />
}
