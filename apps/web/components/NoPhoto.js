import { copy } from '@/copy/en'

/** What stands where a car's picture would be until its company adds one. Never a drawing of some other car. */
export default function NoPhoto({ className }) {
  return <span className={className ?? 'text-footnote text-label-2'}>{copy.liveCars.noPhoto}</span>
}
