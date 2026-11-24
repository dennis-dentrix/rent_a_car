import { ImageResponse } from 'next/og'
import { brand } from '@rent-a-car/shared/brand'
import { ARC_PATH, FAVICON_ARC_WIDTH, GRID } from '@/lib/logo-geometry'

export const size = { width: 64, height: 64 }
export const contentType = 'image/png'

// The tab icon is the mark without the dot, heavier, on the brand tile: the dot is lost at 16 px.
export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: brand.accent,
        borderRadius: 14,
      }}
    >
      <svg width="46" height="46" viewBox={`0 0 ${GRID} ${GRID}`} fill="none">
        <path d={ARC_PATH} stroke="#FFFFFF" strokeWidth={FAVICON_ARC_WIDTH} strokeLinecap="round" />
      </svg>
    </div>,
    size,
  )
}
