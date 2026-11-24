import { ARC_PATH, DOT, GRID } from '@/lib/logo-geometry'

// Behind a panel the mark is drawn finer than the logo itself: a thin arc and a small dot, so it reads as a
// quiet watermark and never competes with the text.
const BACKDROP_STROKE = 2.2
const BACKDROP_DOT = DOT.r * 0.5

/**
 * The logo's arc and arrival dot, drawn large behind a navy panel. The arc draws itself once and the
 * dot sends out a slow ring: a quiet sign that a ride is on its way.
 */
export default function ArcBackdrop({ className }) {
  const dot = { cx: DOT.cx, cy: DOT.cy, r: BACKDROP_DOT }
  return (
    <svg
      viewBox={`0 0 ${GRID} ${GRID}`}
      className={className}
      fill="none"
      aria-hidden="true"
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
      <circle
        {...dot}
        className="animate-beacon fill-mark-pin [transform-box:fill-box] [transform-origin:center]"
      />
      <circle {...dot} className="fill-mark-pin" />
    </svg>
  )
}
