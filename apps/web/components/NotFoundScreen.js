import { SearchX } from 'lucide-react'
import Button from '@/components/Button'
import EmptyState from '@/components/EmptyState'
import { copy } from '@/copy/en'

const text = copy.errors.notFound

export default function NotFoundScreen() {
  return (
    <main className="flex min-h-[50dvh] flex-col items-center justify-center">
      <EmptyState
        icon={SearchX}
        title={text.title}
        message={text.text}
        action={<Button href="/cars">{text.cars}</Button>}
      />
    </main>
  )
}
