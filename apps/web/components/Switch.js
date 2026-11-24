'use client'

import { useState } from 'react'
import { cx } from '@/lib/cx'

function Track({ label, isOn, onPress }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isOn}
      aria-label={label}
      onClick={onPress}
      className={cx(
        'relative mt-1 h-8 w-14 shrink-0 rounded-pill transition-colors duration-fast',
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
  const [failed, setFailed] = useState(false)
  const press = async () => {
    const next = !shown
    setShown(next)
    setFailed(false)
    if (await onChange(next)) return
    setShown(!next)
    setFailed(true)
  }
  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-headline">{label}</p>
          {hint && <p className="text-callout text-label-2">{hint}</p>}
        </div>
        <Track label={label} isOn={shown} onPress={press} />
      </div>
      {failed && (
        <p role="alert" className="mt-1 text-footnote text-error">
          {failedText}
        </p>
      )}
    </div>
  )
}
