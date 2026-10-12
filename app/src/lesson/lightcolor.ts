// Spectral colour for a wavelength. Kept separate from fringes.ts so the
// sandbox bundle can take this function without the rest of the fringe solver.

export interface RGB {
  r: number
  g: number
  b: number
}

/**
 * Approximate CIE colour of a spectral line, 380–780 nm (Dan Bruton).
 * Outside that window the colour is black. Physical light may use this
 * directly; everything else stays on the theme palette.
 */
export function lightColor(lambdaNm: number): RGB {
  const w = lambdaNm
  let r = 0
  let g = 0
  let b = 0
  if (w >= 380 && w < 440) {
    r = -(w - 440) / (440 - 380)
    b = 1
  } else if (w >= 440 && w < 490) {
    g = (w - 440) / (490 - 440)
    b = 1
  } else if (w >= 490 && w < 510) {
    g = 1
    b = -(w - 510) / (510 - 490)
  } else if (w >= 510 && w < 580) {
    r = (w - 510) / (580 - 510)
    g = 1
  } else if (w >= 580 && w < 645) {
    r = 1
    g = -(w - 645) / (645 - 580)
  } else if (w >= 645 && w <= 780) {
    r = 1
  }
  let factor = 0
  if (w >= 380 && w < 420) factor = 0.3 + (0.7 * (w - 380)) / (420 - 380)
  else if (w >= 420 && w < 701) factor = 1
  else if (w >= 701 && w <= 780) factor = 0.3 + (0.7 * (780 - w)) / (780 - 701)
  const gamma = 0.8
  const ch = (c: number) => (c <= 0 || factor <= 0 ? 0 : Math.round(255 * Math.pow(c * factor, gamma)))
  return { r: ch(r), g: ch(g), b: ch(b) }
}

export function lightColorCss(lambdaNm: number): string {
  const c = lightColor(lambdaNm)
  return `rgb(${c.r},${c.g},${c.b})`
}
