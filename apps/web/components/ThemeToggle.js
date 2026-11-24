'use client'

import { Monitor, Moon, Sun } from 'lucide-react'
import Menu from '@/components/Menu'
import { copy } from '@/copy/en'
import { useThemeMode } from '@/lib/use-theme-mode'

export const MODE_ICONS = { light: Sun, dark: Moon, system: Monitor }

/** Light, dark, or follow the device, as a small menu from a round button. Kept on this device, so it is the same for visitors and signed-in people. */
export default function ThemeToggle() {
  const [mode, choose] = useThemeMode()
  const TriggerIcon = MODE_ICONS[mode]
  const items = Object.entries(MODE_ICONS).map(([value, icon]) => ({
    value,
    icon,
    label: copy.theme.modes[value],
    isSelected: value === mode,
    onSelect: () => choose(value),
  }))

  return (
    <Menu
      label={copy.theme.open}
      triggerIcon={<TriggerIcon size={20} aria-hidden="true" />}
      items={items}
    />
  )
}
