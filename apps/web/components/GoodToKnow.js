import { MAX_FILE_BYTES } from '@rent-a-car/shared'
import TellAndRules from '@/components/TellAndRules'
import { copy } from '@/copy/en'

const BYTES_PER_MB = 1024 * 1024

/** The home page's "Good to know": what to bring for car hire, beside the rules for changing or cancelling. */
export default function GoodToKnow() {
  const { bring } = copy.home.know
  const tell = {
    title: bring.title,
    items: bring.items,
    note: bring.note(MAX_FILE_BYTES / BYTES_PER_MB),
  }
  return <TellAndRules tell={tell} />
}
