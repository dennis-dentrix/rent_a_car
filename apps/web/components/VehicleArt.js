import { ART_HEIGHT, ART_WIDTH, BODY_STYLES, bodyStyleFor } from '@/lib/vehicle-art'

function Wheel({ x, y, radius }) {
  return (
    <g>
      <circle cx={x} cy={y} r={radius + 6} className="fill-stage-to" />
      <circle cx={x} cy={y} r={radius} className="fill-art-tire" />
      <circle cx={x} cy={y} r={radius * 0.5} className="fill-art-hub" />
    </g>
  )
}

/** A clean side-view drawing of a car type, tinted by the theme. `label` is its description for screen readers and search (`isDecorative` hides it when a name sits beside it); `styleHint` (the name and slug) picks the body style. */
export default function VehicleArt({ label, styleHint = label, isDecorative = false, className }) {
  const style = BODY_STYLES[bodyStyleFor(styleHint)]
  return (
    <svg
      viewBox={`0 0 ${ART_WIDTH} ${ART_HEIGHT}`}
      className={className}
      role={isDecorative ? undefined : 'img'}
      aria-label={isDecorative ? undefined : label}
      aria-hidden={isDecorative || undefined}
    >
      <ellipse cx="200" cy="140" rx="170" ry="7" className="fill-art-tire" opacity="0.12" />
      <path d={style.body} className="fill-art-body" />
      {style.extra?.map((path) => (
        <path key={path} d={path} className="fill-art-body" />
      ))}
      {style.glass.map((path) => (
        <path key={path} d={path} className="fill-art-glass" />
      ))}
      {style.wheels.map(([x, y, radius]) => (
        <Wheel key={x} x={x} y={y} radius={radius} />
      ))}
    </svg>
  )
}
