'use client'

import SegmentedControl from '@/components/SegmentedControl'
import { copy } from '@/copy/en'
import { THEME_MODES } from '@/lib/theme'
import { useThemeMode } from '@/lib/use-theme-mode'

/** Light, dark, or follow the device. The same choice the round button in the header offers. */
export default function ThemeSetting() {
  const [mode, choose] = useThemeMode()
  const options = THEME_MODES.map((value) => ({ value, label: copy.theme.modes[value] }))
  return (
    <SegmentedControl
      label={copy.settings.appearance.title}
      options={options}
      value={mode}
      onChange={choose}
    />
  )
}
