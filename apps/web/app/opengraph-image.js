import { ImageResponse } from 'next/og'
import { brand } from '@rent-a-car/shared/brand'
import { copy } from '@/copy/en'
import { ARC_PATH, DOT, GRID } from '@/lib/logo-geometry'

export const alt = `${brand.name}: ${copy.footer.descriptor}`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// The picture shown when a link to the site is shared: the brand arc and dot on the navy gradient.
export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 80,
        color: '#FFFFFF',
        background: `linear-gradient(135deg, ${brand.navy} 0%, ${brand.primary} 55%, ${brand.accent} 120%)`,
      }}
    >
      <svg
        width="420"
        height="420"
        viewBox={`0 0 ${GRID} ${GRID}`}
        fill="none"
        style={{ position: 'absolute', right: 40, top: 100 }}
      >
        <path
          d={ARC_PATH}
          stroke="#FFFFFF"
          strokeOpacity="0.18"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <circle cx={DOT.cx} cy={DOT.cy} r={DOT.r} fill={brand.markPin} />
      </svg>
      <div style={{ fontSize: 112, fontWeight: 700, letterSpacing: -4 }}>{brand.name}</div>
      <div style={{ fontSize: 44, marginTop: 16, maxWidth: 700, opacity: 0.85 }}>
        {copy.footer.descriptor}
      </div>
    </div>,
    size,
  )
}
