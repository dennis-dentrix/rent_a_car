import { Check, Info } from 'lucide-react'
import Checklist from '@/components/Checklist'
import Eyebrow from '@/components/Eyebrow'
import { copy } from '@/copy/en'

/** What to bring or tell us for this service, beside the rules for changing and cancelling (the same for all). */
export default function TellAndRules({ tell }) {
  const { title, items, note } = tell
  const { rules } = copy.home.know
  return (
    <section>
      <Eyebrow>{copy.home.eyebrows.know}</Eyebrow>
      <h2 className="mb-6 text-title-2 md:text-title-1">{copy.home.know.title}</h2>
      <div className="grid gap-4 md:grid-cols-2 md:gap-6">
        <Checklist title={title} items={items} note={note} icon={Check} iconClass="text-success" />
        <Checklist title={rules.title} items={rules.items} icon={Info} iconClass="text-primary" />
      </div>
    </section>
  )
}
