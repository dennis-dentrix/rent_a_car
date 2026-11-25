import { ARC_PATH, DOT, GRID } from '@/lib/logo-geometry'
import { cx } from '@/lib/cx'

// Behind a panel the mark is drawn finer than the logo itself: a thin arc and a small dot, so it reads as a
// quiet watermark and never competes with the text.
const BACKDROP_STROKE = 2.2
const BACKDROP_DOT = DOT.r * 0.5

// Two rings half a cycle apart, so the pulse flows instead of starting over.
const RING_DELAYS = ['2200ms', '3800ms']

const percent = (units) => `${(units / GRID) * 100}%`
const DOT_BOX = {
  left: percent(DOT.cx - BACKDROP_DOT),
  top: percent(DOT.cy - BACKDROP_DOT),
  width: percent(BACKDROP_DOT * 2),
  height: percent(BACKDROP_DOT * 2),
}

// The rings are plain elements, not circles in the drawing: a browser moves and fades those on the graphics chip,
// so they stay smooth while the page is busy.
function Ring({ delay }) {
  return (
    <span
      style={{ ...DOT_BOX, animationDelay: `${delay}, ${delay}` }}
      className="absolute animate-beacon rounded-pill bg-mark-pin opacity-0 will-change-transform"
    />
  )
}

/**
 * The logo's arc and arrival dot, drawn large behind a navy panel. The arc draws itself once and then the dot sends
 * out slow rings: a quiet sign that a ride is on its way. `className` places it and sets its width.
 */
export default function ArcBackdrop({ className }) {
  return (
    <div className={cx('aspect-square', className)} aria-hidden="true">
      <div className="relative h-full w-full">
        <svg
          viewBox={`0 0 ${GRID} ${GRID}`}
          className="h-full w-full"
          fill="none"
          focusable="false"
        >
          <path
            d={ARC_PATH}
            pathLength="1"
            stroke="currentColor"
            strokeWidth={BACKDROP_STROKE}
            strokeLinecap="round"
            strokeDasharray="1"
            className="animate-draw opacity-30"
          />
        </svg>
        {RING_DELAYS.map((delay) => (
          <Ring key={delay} delay={delay} />
        ))}
        <span style={DOT_BOX} className="absolute rounded-pill bg-mark-pin" />
      </div>
    </div>
  )
}
