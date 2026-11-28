import PublicShell from '@/components/PublicShell'
import { getListedClasses, getLocations } from '@/lib/catalogue'
import { buildSuggestions } from '@/lib/suggestions'

// The header search suggests car types and places from the API (cached); services come from the shared list.
export default async function SiteLayout({ children }) {
  const [classes, locations] = await Promise.all([getListedClasses(), getLocations()])
  const suggestions = buildSuggestions({
    classes: classes.data ?? [],
    locations: locations.data ?? [],
  })
  return <PublicShell suggestions={suggestions}>{children}</PublicShell>
}
