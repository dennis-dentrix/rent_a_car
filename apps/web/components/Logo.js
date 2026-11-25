import { brand } from '@carvo/shared/brand'
import { ARC_PATH, ARC_WIDTH, DOT, FAVICON_ARC_WIDTH, GRID } from '@/lib/logo-geometry'

const TONES = { accent: 'text-accent', inverse: 'text-on-accent', current: '' }

function Mark({ size, hasDot, hasHeavyStroke }) {
  return (
    <svg width={size} height={size} viewBox={`0 0 ${GRID} ${GRID}`} fill="none" aria-hidden="true">
      <path
        d={ARC_PATH}
        stroke="currentColor"
        strokeWidth={hasHeavyStroke ? FAVICON_ARC_WIDTH : ARC_WIDTH}
        strokeLinecap="round"
      />
      {hasDot && <circle {...DOT} fill="var(--color-mark-pin)" />}
    </svg>
  )
}

function Tile({ size }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-panel bg-accent text-on-accent"
      style={{ width: size, height: size }}
    >
      <Mark size={size * 0.7} hasDot />
    </span>
  )
}

/**
 * variant: "mark" (arc and dot), "wordmark" (mark and name, the header lockup), "tile" (app icon).
 * tone: "accent", "inverse", or "current" (single colour, for print and the vehicle decal).
 * hasDot is false for the single-colour and tab-size versions.
 */
export default function Logo({ variant = 'wordmark', tone = 'accent', size = 28, hasDot = true }) {
  if (variant === 'tile') return <Tile size={size} />
  const mark = <Mark size={size} hasDot={hasDot} hasHeavyStroke={!hasDot} />
  if (variant === 'mark') return <span className={TONES[tone]}>{mark}</span>
  return (
    <span className="inline-flex items-center gap-2" aria-label={brand.name} role="img">
      <span className={TONES[tone]}>{mark}</span>
      <span className={size >= 28 ? 'text-title-2 text-label' : 'text-headline text-label'}>
        {brand.name}
      </span>
    </span>
  )
}
