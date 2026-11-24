'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { FIELD_CLASS, FieldFrame } from '@/components/Field'
import { copy } from '@/copy/en'
import { cx } from '@/lib/cx'

/**
 * A password input with a button to show or hide what was typed, so a small phone keyboard is not a trap. The
 * button is a toggle (aria-pressed) as large to tap as any other control. `autoComplete` tells the browser whether
 * to offer the saved password ("current-password") or to suggest a new one ("new-password").
 */
export default function PasswordField({ label, helper, error, autoComplete, ...rest }) {
  const [isShown, setIsShown] = useState(false)
  const toggleLabel = isShown ? copy.auth.hidePassword : copy.auth.showPassword
  const Icon = isShown ? EyeOff : Eye
  return (
    <FieldFrame label={label} helper={helper} error={error}>
      {(controlProps) => (
        <div className="relative">
          <input
            type={isShown ? 'text' : 'password'}
            autoComplete={autoComplete}
            autoCapitalize="none"
            spellCheck={false}
            className={cx(FIELD_CLASS, 'pr-14')}
            {...controlProps}
            {...rest}
          />
          <button
            type="button"
            aria-label={toggleLabel}
            aria-pressed={isShown}
            onClick={() => setIsShown((shown) => !shown)}
            className="state-layer absolute right-1 top-1/2 inline-flex h-compact min-w-compact -translate-y-1/2 items-center justify-center rounded-control text-label-2"
          >
            <Icon size={20} aria-hidden="true" />
          </button>
        </div>
      )}
    </FieldFrame>
  )
}
