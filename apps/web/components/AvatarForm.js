'use client'

import { attempt } from '@/lib/attempt'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { removeAvatarAction } from '@/app/(site)/account/actions'
import Alert from '@/components/Alert'
import Avatar from '@/components/Avatar'
import Button from '@/components/Button'
import { copy } from '@/copy/en'
import { PROFILE_CHANGED } from '@/lib/avatar'
import { uploadAvatar } from '@/lib/avatar-upload'

const text = copy.auth.account

/** Sending and removing the picture, with what the screen needs to say about it: busy, or what went wrong. */
function useAvatarActions() {
  const router = useRouter()
  const input = useRef(null)
  const [state, setState] = useState({ isBusy: false, error: '' })

  const finish = (error = '') => {
    setState({ isBusy: false, error })
    if (error) return
    window.dispatchEvent(new Event(PROFILE_CHANGED))
    router.refresh()
  }

  const choose = async (event) => {
    const file = event.target.files[0]
    if (!file) return
    setState({ isBusy: true, error: '' })
    const result = await attempt(() => uploadAvatar(file), { error: 'upload' })
    input.current.value = ''
    finish(result.error ? text.errors[result.error] : '')
  }

  const remove = async () => {
    setState({ isBusy: true, error: '' })
    const result = await attempt(removeAvatarAction)
    finish(result.error ? text.errors.remove : '')
  }

  return { input, state, choose, remove }
}

function buttonLabel(isBusy, hasPicture) {
  if (isBusy) return text.working
  return hasPicture ? text.change : text.add
}

/**
 * The person's picture, with a button to choose another and one to remove it. Choosing sends it at once: there is
 * nothing else to fill in. The old picture stays until the new one is saved, and the header is told when it changes.
 */
export default function AvatarForm({ name, src }) {
  const { input, state, choose, remove } = useAvatarActions()
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-headline">{text.picture}</h2>
      {state.error && <Alert tone="error" title={state.error} />}
      <div className="flex items-center gap-4">
        <Avatar name={name} src={src} size={80} />
        <div className="flex flex-col items-start gap-2">
          <Button
            type="button"
            variant="tonal"
            size="compact"
            isLoading={state.isBusy}
            onClick={() => input.current.click()}
          >
            {buttonLabel(state.isBusy, Boolean(src))}
          </Button>
          {src && !state.isBusy && (
            <Button type="button" variant="plain" size="compact" onClick={remove}>
              {text.remove}
            </Button>
          )}
        </div>
      </div>
      <p className="text-footnote text-label-2">{text.pictureHelper}</p>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        tabIndex={-1}
        aria-label={text.add}
        onChange={choose}
      />
    </section>
  )
}
