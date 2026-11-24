// Side-view vehicle drawings on a 400 x 160 grid, one per body style. They stand in for photographs
// until real photos exist, and stay on the car-type cards as the fallback when a photo is missing.
export const ART_WIDTH = 400
export const ART_HEIGHT = 160

export const BODY_STYLES = {
  hatch: {
    body: 'M30 112 L30 96 C30 86 36 82 48 80 L96 72 C112 52 138 40 176 40 L236 40 C268 40 292 56 308 76 L350 84 C366 87 372 94 372 104 L372 112 Z',
    glass: [
      'M112 74 C126 56 146 48 176 48 L206 48 L206 74 Z',
      'M216 48 L236 48 C258 48 276 60 288 74 L216 74 Z',
    ],
    wheels: [
      [98, 112, 21],
      [306, 112, 21],
    ],
  },
  sedan: {
    body: 'M22 112 L22 98 C22 88 30 84 44 82 L108 74 C130 52 160 42 200 42 L252 42 C280 42 300 58 316 76 L366 82 C380 84 386 92 386 104 L386 112 Z',
    glass: [
      'M126 74 C142 56 164 50 196 50 L214 50 L214 74 Z',
      'M224 50 L248 50 C268 50 284 62 296 74 L224 74 Z',
    ],
    wheels: [
      [92, 112, 21],
      [318, 112, 21],
    ],
  },
  suv: {
    body: 'M26 118 L26 90 C26 80 32 76 44 74 L88 68 C100 40 124 32 156 32 L292 32 C312 32 322 44 328 62 L364 68 C378 70 384 80 384 92 L384 118 Z',
    glass: [
      'M110 66 C120 44 134 40 156 40 L196 40 L196 66 Z',
      'M206 40 L286 40 C298 40 304 50 308 66 L206 66 Z',
    ],
    wheels: [
      [96, 118, 24],
      [314, 118, 24],
    ],
  },
  van: {
    body: 'M24 118 L24 60 C24 46 32 40 46 40 L270 40 C290 40 300 50 308 66 L360 74 C376 77 384 86 384 98 L384 118 Z',
    glass: [
      'M44 50 L120 50 L120 70 L44 70 Z',
      'M132 50 L236 50 L236 70 L132 70 Z',
      'M248 48 L276 48 C288 48 296 58 300 70 L248 70 Z',
    ],
    wheels: [
      [92, 118, 24],
      [316, 118, 24],
    ],
  },
  // A safari tour van: a tall body with a raised roof that pops up for game viewing, and a row of big windows.
  tour: {
    body: 'M24 118 L24 62 C24 50 32 46 46 46 L270 46 C290 46 300 54 308 68 L360 76 C376 79 384 88 384 100 L384 118 Z',
    extra: ['M58 46 L58 34 C58 30 62 28 66 28 L244 28 C250 28 254 31 256 36 L262 46 Z'],
    glass: [
      'M44 56 L112 56 L112 78 L44 78 Z',
      'M122 56 L190 56 L190 78 L122 78 Z',
      'M200 56 L252 56 L252 78 L200 78 Z',
      'M262 54 L282 54 C292 54 298 62 302 78 L262 78 Z',
    ],
    wheels: [
      [92, 118, 24],
      [316, 118, 24],
    ],
  },
  pickup: {
    body: 'M24 118 L24 92 C24 84 30 80 40 80 L186 80 L186 62 C196 42 214 34 240 34 L292 34 C306 34 316 42 324 58 L362 66 C378 69 384 78 384 90 L384 118 Z',
    glass: [
      'M204 62 C212 46 224 42 240 42 L262 42 L262 62 Z',
      'M270 42 L290 42 C300 42 306 50 312 62 L270 62 Z',
    ],
    wheels: [
      [92, 118, 24],
      [316, 118, 24],
    ],
  },
}

const MATCHES = [
  ['tour', ['tour', 'safari']],
  ['van', ['van', 'minibus', 'shuttle']],
  ['pickup', ['pickup', 'truck']],
  ['suv', ['suv', '4x4', 'crossover']],
  ['sedan', ['sedan', 'premium', 'executive', 'saloon', 'luxury']],
]

/** Picks the drawing for a car type from its name or slug. Anything unrecognised is a hatchback. */
export function bodyStyleFor(label) {
  const text = label.toLowerCase()
  return MATCHES.find(([, words]) => words.some((word) => text.includes(word)))?.[0] ?? 'hatch'
}
