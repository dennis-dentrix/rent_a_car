'use client'

import { copy } from '@/copy/en'
import { attempt } from '@/lib/attempt'
import { useState } from 'react'
import { cx } from '@/lib/cx'

function Track({ label, isOn, isSaving, onPress }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isOn}
      aria-label={label}
      aria-busy={isSaving}
      disabled={isSaving}
      onClick={onPress}
      className={cx(
        // The invisible edge above and below makes the target tall enough for a thumb.
        'relative mt-1 h-8 w-14 shrink-0 rounded-pill transition-colors duration-fast after:absolute after:inset-x-0 after:-inset-y-1.5',
        isOn ? 'bg-primary' : 'bg-fill',
      )}
    >
      <span
        className={cx(
          'absolute left-1 top-1 h-6 w-6 rounded-pill bg-surface shadow-1 transition-transform duration-fast',
          isOn && 'translate-x-6',
        )}
      />
    </button>
  )
}

/**
 * An on/off switch that acts the moment it is pressed. It shows the new position at once and asks the server to keep
 * it; if the server refuses, it goes back and says so. `onChange(isOn)` resolves true when the server kept it.
 */
export default function Switch({ label, hint, isOn, onChange, failedText }) {
  const [shown, setShown] = useState(isOn)
  const [state, setState] = useState('idle')
  const press = async () => {
    const next = !shown
    setShown(next)
    setState('saving')
    const isKept = await attempt(() => onChange(next), false)
    if (!isKept) setShown(!next)
    setState(isKept ? 'idle' : 'failed')
  }
  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-headline">{label}</p>
          {hint && <p className="text-callout text-label-2">{hint}</p>}
        </div>
        <Track label={label} isOn={shown} isSaving={state === 'saving'} onPress={press} />
      </div>
      {state === 'saving' && (
        <p role="status" className="mt-1 text-footnote text-label-2">
          {copy.errors.saving}
        </p>
      )}
      {state === 'failed' && (
        <p role="alert" className="mt-1 text-footnote text-error">
          {failedText}
        </p>
      )}
    </div>
  )
}
