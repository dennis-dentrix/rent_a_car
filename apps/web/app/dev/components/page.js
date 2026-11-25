import { Alerts, Badges, Lists, Placeholders, Prices } from './Display'
import { LogoVariants, Swatches, TypeScale } from './Foundations'
import { Buttons, Dates, Fields, Overlays } from './Interactive'
import LargeTitle from '@/components/LargeTitle'
import ThemeToggle from '@/components/ThemeToggle'

export const metadata = { title: 'Components' }

const SECTIONS = [
  ['Logo', LogoVariants],
  ['Colour', Swatches],
  ['Type', TypeScale],
  ['Buttons', Buttons],
  ['Fields', Fields],
  ['Dates', Dates],
  ['Overlays', Overlays],
  ['Badges', Badges],
  ['Alerts', Alerts],
  ['Prices', Prices],
  ['Lists and tables', Lists],
  ['Loading and empty', Placeholders],
]

// Every component in every state. Check it in light and dark, at 360 and 1280 px.
export default function ComponentsPage() {
  return (
    <main className="mx-auto max-w-page px-4 py-6 md:px-6 lg:px-10">
      <div className="flex items-start justify-between">
        <LargeTitle subtitle="Internal. Not in the production build.">Components</LargeTitle>
        <ThemeToggle />
      </div>
      {SECTIONS.map(([title, Section]) => (
        <section key={title} className="mb-10">
          <h2 className="mb-4 text-title-2">{title}</h2>
          <Section />
        </section>
      ))}
    </main>
  )
}
