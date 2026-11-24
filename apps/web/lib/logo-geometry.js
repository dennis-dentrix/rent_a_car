// One drawing for the mark, used by the Logo component and by the generated favicon and app icon.
// A 48 x 48 grid: a "C" transit arc, open to the right, with an arrival dot in the opening.
export const GRID = 48

// Arc of radius 16 around the centre, from 45 degrees above the right edge round to 45 degrees below.
export const ARC_PATH = 'M35.3 12.7A16 16 0 1 0 35.3 35.3'

export const ARC_WIDTH = 6
// The favicon drops the dot and thickens the stroke so the mark holds at 16 px.
export const FAVICON_ARC_WIDTH = 8

export const DOT = { cx: 38, cy: 24, r: 3.5 }
