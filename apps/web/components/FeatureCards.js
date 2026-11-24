import Eyebrow from '@/components/Eyebrow'
import IconTile from '@/components/IconTile'
import Reveal from '@/components/Reveal'

const TONES = ['blue', 'peach', 'green']

/** A heading and a grid of short cards. With `icons` (in step with `items`) each card leads with an icon. */
export default function FeatureCards({
  eyebrow,
  title,
  note,
  items,
  icons,
  columns = 'md:grid-cols-3',
}) {
  return (
    <section>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mb-2 text-title-2 md:text-title-1">{title}</h2>
      {note && <p className="mb-6 max-w-2xl text-body text-label-2">{note}</p>}
      <ul className={`mt-6 grid gap-4 md:gap-6 ${columns}`}>
        {items.map((item, index) => (
          <li key={item.title}>
            <Reveal delay={(index % 3) * 60} className="h-full">
              <div className="h-full rounded-panel border border-separator bg-surface p-5 shadow-1 md:p-6">
                {icons && (
                  <IconTile
                    icon={icons[index]}
                    tone={TONES[index % TONES.length]}
                    className="mb-4"
                  />
                )}
                <h3 className="text-headline">{item.title}</h3>
                <p className="mt-1 text-callout text-label-2">{item.text}</p>
              </div>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  )
}
