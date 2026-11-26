'use client'

import { LogOut } from 'lucide-react'
import { DISPLAY_CURRENCIES } from '@/lib/currency'
import { signOutAction } from '@/app/auth/actions'
import Button from '@/components/Button'
import { useCurrency } from '@/components/CurrencyProvider'
import SegmentedControl from '@/components/SegmentedControl'
import { copy } from '@/copy/en'
import { useThemeMode } from '@/lib/use-theme-mode'
import { useWho } from '@/lib/use-who'

const text = copy.menu
const MODES = Object.entries(copy.theme.modes).map(([value, label]) => ({ value, label }))

/** KES or US dollars, shown only on the public site. A currency with no rate yet is left out. */
export function CurrencyChoice() {
  const { currency, rates, setCurrency } = useCurrency()
  const options = DISPLAY_CURRENCIES.filter((code) => code === 'KES' || rates[code]).map(
    (code) => ({ value: code, label: code }),
  )
  if (options.length < 2) return null
  return (
    <SegmentedControl
      label={text.currency}
      options={options}
      value={currency}
      onChange={setCurrency}
    />
  )
}

/** The foot of the phone menu: light or dark, and signing out. `children` come first. */
export default function MenuChoices({ children }) {
  const [mode, choose] = useThemeMode()
  const { who } = useWho()
  return (
    <>
      {children}
      <SegmentedControl label={text.appearance} options={MODES} value={mode} onChange={choose} />
      {who && (
        <form action={signOutAction}>
          <Button type="submit" variant="destructive" size="compact" isFullWidth>
            <LogOut size={18} aria-hidden="true" />
            {copy.auth.signOut}
          </Button>
        </form>
      )}
    </>
  )
}
