import Checklist from '@/components/Checklist'
import SectionHeading from '@/components/SectionHeading'
import { copy } from '@/copy/en'

/** What to bring or tell us for this service, beside the rules for changing and cancelling (the same for all). */
export default function TellAndRules({ tell }) {
  return (
    <section>
      <SectionHeading title={copy.home.know.title} />
      <div className="grid gap-8 md:grid-cols-2">
        <Checklist {...tell} />
        <Checklist {...copy.home.know.rules} />
      </div>
    </section>
  )
}
