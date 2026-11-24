import Alert from '@/components/Alert'
import { copy } from '@/copy/en'

/** A message carried in the address after a step finished (`?notice=password-changed`). Unknown names show nothing. */
export default function AuthNotice({ name }) {
  const notice = copy.auth.notices[name]
  return notice ? <Alert tone={notice.tone} title={notice.text} /> : null
}
